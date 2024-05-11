import 'angular-server-side-configuration/process';

export const environment = {
  title: process.env['TITLE'],
};
