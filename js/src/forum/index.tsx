import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import Button from 'flarum/common/components/Button';
import Tooltip from 'flarum/common/components/Tooltip';
import { payload } from '../common/look';
import listViews from './listViews';
import tagAccent from './tagAccent';
import { show } from './own';

app.initializers.add('ernestdefoe-skylight', () => {
  // A guest's look was copied on by the <head> script; this re-applies it
  // against the forum's current locks (and does nothing on another theme).
  // After boot: app.session does not exist while initializers run.
  extend(app, 'mount', function () {
    if (!app.session.user) show();
  });

  extend(HeaderSecondary.prototype, 'items', function (items) {
    if (!document.documentElement.hasAttribute('data-sky') || !payload().canUseStudio) return;

    const label = app.translator.trans('ernestdefoe-skylight.forum.studio.open');

    items.add(
      'skylightStudio',
      <Tooltip text={label}>
        <Button
          className="Button Button--flat Skylight-studioButton"
          icon="fas fa-palette"
          aria-label={label as any}
          onclick={() => app.modal.show(() => import('./components/StudioModal'))}
        >
          <span className="Button-label">{label}</span>
        </Button>
      </Tooltip>,
      13
    );
  });

  listViews();
  tagAccent();
});
