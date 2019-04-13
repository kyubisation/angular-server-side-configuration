import { randomBytes } from 'crypto';
import { mkdirSync, readFile } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';

import { envContent, envContentNg4Env, envContentNgEnv, temporaryFile } from '../test/temporary-fs';

import { TokenizedVariables } from './models';
import { VariableTokenizer } from './variable-tokenizer';
const readFileAsync = promisify(readFile);

describe('VariableTokenizer', () => {
  let root: string;
  let environmentFilePath: string;
  let bundlePath: string;

  beforeEach(() => {
    root = join(tmpdir(), randomBytes(20).toString('hex'));
    mkdirSync(root);
    environmentFilePath = join(root, 'environment.prod.ts');
    bundlePath = join(root, 'main.js');
  });

  afterEach(() => {
    rimraf.sync(root);
  });

  it('should tokenize environment file with process.env variables', async () => {
    await testTokenization(envContent, /process\./g);
  });

  it('should tokenize environment file with NG_ENV variables', async () => {
    await testTokenization(envContentNgEnv, /NG_ENV\./g);
  });

  it('should tokenize environment file with NG_ENV variables (ng4-env)', async () => {
    await testTokenization(envContentNg4Env, /NG_ENV\./g);
  });

  it('should untokenize variables', async () => {
    const variables: TokenizedVariables = {
      revert: async () => undefined,
      variables: [
        {
          expression: `process.env.API_ADRESS || 'http://example.com'`,
          token: 'ngssc-token-1554237295705-2',
          variable: 'API_ADRESS',
        },
        {
          expression: `process.env.TERNARY ? 'asdf' : 'qwer'`,
          token: 'ngssc-token-1554237295705-3',
          variable: 'TERNARY',
        },
        { expression: `process.env.SIMPLE_VALUE`, token: 'ngssc-token-1554237295705-4', variable: 'SIMPLE_VALUE' },
        { expression: `parseInt(process.env.NUMBER)`, token: 'ngssc-token-1554237295705-6', variable: 'NUMBER' },
      ],
      variant: 'process-env',
    };
    const tokenizer = new VariableTokenizer();
    const finalContent = await temporaryFile({ file: bundlePath, content: minifiedTokenizedFile }, async () => {
      await tokenizer.untokenize(root, variables);
    });
    expect(finalContent).not.toContain('ngssc-token-');
    for (const variable of variables.variables) {
      expect(finalContent).toContain(variable.expression);
    }
  });

  async function testTokenization(environmentContent: string, match: RegExp) {
    const tokenizer = new VariableTokenizer();
    let tokenizedContent = '';
    const finalContent = await temporaryFile(
      { file: environmentFilePath, content: environmentContent },
      async () => {
        const result = await tokenizer.tokenize(environmentFilePath);
        tokenizedContent = await readFileAsync(environmentFilePath, 'utf8');
        await result.revert();
      });

    expect(tokenizedContent).toMatch(/import 'angular-server-side-configuration\/(process|ng-env|ng4-env)';/);
    expect(tokenizedContent).toContain('ngssc-token-');
    expect(tokenizedContent.match(match)!.length).toEqual(7);
    expect(finalContent).toEqual(environmentContent);
  }
});

const minifiedTokenizedFile =
  `(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{0:function(l,n,u){l.exports=u("zUnb")},crnd`
  + `:function(l,n){function u(l){return Promise.resolve().then(function(){var n=new Error("Cannot find m`
  + `odule '"+l+"'");throw n.code="MODULE_NOT_FOUND",n})}u.keys=function(){return[]},u.resolve=u,l.export`
  + `s=u,u.id="crnd"},zUnb:function(l,n,u){"use strict";u.r(n);var t=u("CcnG");try{window}catch(A){}var e`
  + `=function(){return function(){}}(),o=function(){return function(l){this.apiAddress=l,this.thingy="ng`
  + `ssc-token-1554237295705-2/asdf",this.thingy2="-ngssc-token-1554237295705-2/qwer",this.thingy3="-ngss`
  + `c-token-1554237295705-2"}}(),r=function(){return function(l){this.example=l,this.title="ng7-sandbox"`
  + `,this.ternary="ngssc-token-1554237295705-3"}}(),b=u("pMnS"),i=u("ZYCi"),c=t.ib({encapsulation:0,styl`
  + `es:[[""]],data:{}});function s(l){return t.tb(0,[(l()(),t.kb(0,0,null,null,9,"div",[["style","text-a`
  + `lign:center"]],null,null,null,null,null)),(l()(),t.kb(1,0,null,null,1,"h1",[],null,null,null,null,nu`
  + `ll)),(l()(),t.sb(2,null,[" Welcome to ","! "])),(l()(),t.kb(3,0,null,null,1,"p",[],null,null,null,nu`
  + `ll,null)),(l()(),t.sb(4,null,[" "," "])),(l()(),t.kb(5,0,null,null,1,"p",[],null,null,null,null,null`
  + `)),(l()(),t.sb(6,null,[" "," "])),(l()(),t.kb(7,0,null,null,1,"p",[],null,null,null,null,null)),(l()`
  + `(),t.sb(8,null,[" "," "])),(l()(),t.kb(9,0,null,null,0,"img",[["alt","Angular Logo"],["src","data:im`
  + `age/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwI`
  + `j4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzL`
  + `jcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuN`
  + `yAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoM`
  + `jEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvP`
  + `gogIDwvc3ZnPg=="],["width","300"]],null,null,null,null,null)),(l()(),t.kb(10,0,null,null,1,"h2",[],n`
  + `ull,null,null,null,null)),(l()(),t.sb(-1,null,["Here are some links to help you start: "])),(l()(),t`
  + `.kb(12,0,null,null,12,"ul",[],null,null,null,null,null)),(l()(),t.kb(13,0,null,null,3,"li",[],null,n`
  + `ull,null,null,null)),(l()(),t.kb(14,0,null,null,2,"h2",[],null,null,null,null,null)),(l()(),t.kb(15,`
  + `0,null,null,1,"a",[["href","https://angular.io/tutorial"],["rel","noopener"],["target","_blank"]],nu`
  + `ll,null,null,null,null)),(l()(),t.sb(-1,null,["Tour of Heroes"])),(l()(),t.kb(17,0,null,null,3,"li",`
  + `[],null,null,null,null,null)),(l()(),t.kb(18,0,null,null,2,"h2",[],null,null,null,null,null)),(l()()`
  + `,t.kb(19,0,null,null,1,"a",[["href","https://github.com/angular/angular-cli/wiki"],["rel","noopener"`
  + `],["target","_blank"]],null,null,null,null,null)),(l()(),t.sb(-1,null,["CLI Documentation"])),(l()()`
  + `,t.kb(21,0,null,null,3,"li",[],null,null,null,null,null)),(l()(),t.kb(22,0,null,null,2,"h2",[],null,`
  + `null,null,null,null)),(l()(),t.kb(23,0,null,null,1,"a",[["href","https://blog.angular.io/"],["rel","`
  + `noopener"],["target","_blank"]],null,null,null,null,null)),(l()(),t.sb(-1,null,["Angular blog"])),(l`
  + `()(),t.kb(25,16777216,null,null,1,"router-outlet",[],null,null,null,null,null)),t.jb(26,212992,null,`
  + `0,i.m,[i.b,t.L,t.j,[8,null],t.h],null,null)],function(l,n){l(n,26,0)},function(l,n){var u=n.componen`
  + `t;l(n,2,0,u.title),l(n,4,0,u.example.thingy),l(n,6,0,u.example.apiAddress),l(n,8,0,u.ternary)})}func`
  + `tion a(l){return t.tb(0,[(l()(),t.kb(0,0,null,null,1,"app-root",[],null,null,null,s,c)),t.jb(1,49152`
  + `,null,0,r,[o],null,null)],null,null)}var g=t.gb("app-root",r,a,{},{},[]),q=u("Ip0R"),f=u("ZYjt"),p=n`
  + `ew t.o("api.address"),k=new t.o("prod.token"),d=function(){function l(){}return l.forRoot=function(n`
  + `){return{ngModule:l,providers:[{provide:p,useValue:n},{provide:k,useValue:"false"!==n}]}},l}(),M=fun`
  + `ction(){return function(){}}(),y=new t.o("example1"),w=function(){function l(){}return l.forRoot=fun`
  + `ction(n){return{ngModule:l,providers:[{provide:y,useValue:n}]}},l}(),I=new t.o("example4"),h=functio`
  + `n(){function l(){}return l.forRoot=function(n){return{ngModule:l,providers:[{provide:I,useValue:n}]}`
  + `},l}(),j=new t.o("example2"),v=function(){function l(){}return l.forRoot=function(n){return{ngModule`
  + `:l,providers:[{provide:j,useValue:n}]}},l}(),x=t.hb(e,[r],function(l){return t.pb([t.qb(512,t.j,t.X,`
  + `[[8,[b.a,g]],[3,t.j],t.w]),t.qb(5120,t.t,t.fb,[[3,t.t]]),t.qb(4608,q.i,q.h,[t.t,[2,q.o]]),t.qb(5120,`
  + `t.c,t.cb,[]),t.qb(5120,t.r,t.db,[]),t.qb(5120,t.s,t.eb,[]),t.qb(4608,f.b,f.k,[q.c]),t.qb(6144,t.E,nu`
  + `ll,[f.b]),t.qb(4608,f.e,f.g,[]),t.qb(5120,f.c,function(l,n,u,t,e,o,r,b){return[new f.i(l,n,u),new f.`
  + `n(t),new f.m(e,o,r,b)]},[q.c,t.y,t.A,q.c,q.c,f.e,t.Y,[2,f.f]]),t.qb(4608,f.d,f.d,[f.c,t.y]),t.qb(135`
  + `680,f.l,f.l,[q.c]),t.qb(4608,f.j,f.j,[f.d,f.l]),t.qb(6144,t.C,null,[f.j]),t.qb(6144,f.o,null,[f.l]),`
  + `t.qb(4608,t.J,t.J,[t.y]),t.qb(5120,i.a,i.x,[i.k]),t.qb(4608,i.d,i.d,[]),t.qb(6144,i.f,null,[i.d]),t.`
  + `qb(135680,i.n,i.n,[i.k,t.v,t.i,t.p,i.f]),t.qb(4608,i.e,i.e,[]),t.qb(5120,i.B,i.t,[i.k,q.l,i.g]),t.qb`
  + `(5120,i.h,i.A,[i.y]),t.qb(5120,t.b,function(l){return[l]},[i.h]),t.qb(4608,o,o,[p]),t.qb(1073742336,`
  + `q.b,q.b,[]),t.qb(1024,t.k,f.p,[]),t.qb(1024,t.x,function(){return[i.s()]},[]),t.qb(512,i.y,i.y,[t.p]`
  + `),t.qb(1024,t.d,function(l,n){return[f.q(l),i.z(n)]},[[2,t.x],i.y]),t.qb(512,t.e,t.e,[[2,t.d]]),t.qb`
  + `(131584,t.g,t.g,[t.y,t.Y,t.p,t.k,t.j,t.e]),t.qb(1073742336,t.f,t.f,[t.g]),t.qb(1073742336,f.a,f.a,[[`
  + `3,f.a]]),t.qb(1024,i.r,i.v,[[3,i.k]]),t.qb(512,i.p,i.c,[]),t.qb(512,i.b,i.b,[]),t.qb(256,i.g,{},[]),`
  + `t.qb(1024,q.g,i.u,[q.k,[2,q.a],i.g]),t.qb(512,q.f,q.f,[q.g]),t.qb(512,t.i,t.i,[]),t.qb(512,t.v,t.H,[`
  + `t.i,[2,t.I]]),t.qb(1024,i.i,function(){return[[]]},[]),t.qb(1024,i.k,i.w,[t.g,i.p,i.b,q.f,t.p,t.v,t.`
  + `i,i.i,i.g,[2,i.o],[2,i.j]]),t.qb(1073742336,i.l,i.l,[[2,i.r],[2,i.k]]),t.qb(1073742336,M,M,[]),t.qb(`
  + `1073742336,d,d,[]),t.qb(1073742336,w,w,[]),t.qb(1073742336,h,h,[]),t.qb(1073742336,v,v,[]),t.qb(1073`
  + `742336,e,e,[]),t.qb(256,t.W,!0,[]),t.qb(256,p,"ngssc-token-1554237295705-2",[]),t.qb(256,k,!0,[]),t.`
  + `qb(256,y,"ngssc-token-1554237295705-3",[]),t.qb(256,I,"ngssc-token-1554237295705-4",[]),t.qb(256,j,"`
  + `ngssc-token-1554237295705-6",[])])});Object(t.Q)(),f.h().bootstrapModuleFactory(x).catch(function(l)`
  + `{return console.error(l)})}},[[0,0,4]]]);`;
