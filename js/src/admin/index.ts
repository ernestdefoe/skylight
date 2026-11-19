import app from 'flarum/admin/app';
import SkylightPage from './components/SkylightPage';

app.initializers.add('ernestdefoe-skylight', () => {
  app.registry
    .for('ernestdefoe-skylight')
    .registerPage(SkylightPage)
    .registerPermission(
      {
        icon: 'fas fa-sliders-h',
        label: app.translator.trans('ernestdefoe-skylight.admin.permissions.use_studio'),
        permission: 'ernestdefoe-skylight.useStudio',
        allowGuest: true,
      },
      'view'
    );
});
