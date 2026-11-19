import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Form from 'flarum/common/components/Form';
import Switch from 'flarum/common/components/Switch';
import Alert from 'flarum/common/components/Alert';
import UploadImageButton from 'flarum/common/components/UploadImageButton';
import type Mithril from 'mithril';
import LookControls from '../../common/components/LookControls';
import { accents, contrast } from '../../common/color';
import { BUILT_IN, hexList, Look, LookKey, payload, sanitize, SECTIONS } from '../../common/look';

const t = (key: string, params?: any) => app.translator.trans(`ernestdefoe-skylight.admin.${key}`, params);
const SLOTS = ['img1', 'img2', 'img3', 'img4'];

/**
 * Skylight's settings: the forum's defaults (the same controls members get
 * in their Studio), which Studio sections members may use, the extra accent
 * presets, the backgrounds and the two switches.
 */
export default class SkylightPage extends ExtensionPage {
  content(vnode: Mithril.VnodeDOM<any, this>) {
    const defaults = this.defaults();
    const sections = this.openSections();
    const p = payload();

    return (
      <div className="ExtensionPage-settings SkylightAdmin">
        <div className="container">
          {p.blockedByBespoke && (
            <Alert type="warning" dismissible={false} className="SkylightAdmin-alert">
              {t('bespoke_notice')}
            </Alert>
          )}
          <Form>
            <div className="SkylightAdmin-grid">
              <section className="SkylightAdmin-card">
                <h3>{t('defaults.title')}</h3>
                <p className="helpText">{t('defaults.help')}</p>
                <LookControls
                  look={defaults}
                  sections={Object.keys(SECTIONS)}
                  readability={false}
                  presets={hexList(this.setting('ernestdefoe-skylight.presets')())}
                  backgrounds={p.backgrounds}
                  onchange={(key: LookKey, value: any) => this.setDefault(key, value)}
                />
                {this.contrastReadout(defaults)}
              </section>

              <div className="SkylightAdmin-column">
                <section className="SkylightAdmin-card">
                  <h3>{t('studio.title')}</h3>
                  <p className="helpText">{t('studio.help')}</p>
                  <div className="SkylightAdmin-checks">
                    {Object.keys(SECTIONS).map((section) => (
                      <Switch state={sections.includes(section)} onchange={(on: boolean) => this.toggleSection(section, on)}>
                        {app.translator.trans(`ernestdefoe-skylight.lib.sections.${section}`)}
                      </Switch>
                    ))}
                  </div>
                  <p className="helpText">{t('studio.readability_always')}</p>
                  <p className="helpText">{t('studio.permission')}</p>
                </section>

                <section className="SkylightAdmin-card">
                  <h3>{t('presets.title')}</h3>
                  <p className="helpText">{t('presets.help')}</p>
                  <input
                    className="FormControl"
                    placeholder="#1f8a6f, #9a4fb0"
                    value={hexList(this.setting('ernestdefoe-skylight.presets')()).join(', ')}
                    onchange={(e: Event) => this.setting('ernestdefoe-skylight.presets')(JSON.stringify(hexList((e.target as HTMLInputElement).value).slice(0, 6)))}
                  />
                </section>

                <section className="SkylightAdmin-card">
                  <h3>{t('backgrounds.title')}</h3>
                  <p className="helpText">{t('backgrounds.help')}</p>
                  <div className="SkylightAdmin-uploads">
                    {SLOTS.map((slot) => (
                      <UploadImageButton
                        name="skylight-bg"
                        routePath={`skylight/backgrounds/${slot}`}
                        value={app.data.settings[`ernestdefoe-skylight.bg_${slot}`]}
                        url={p.backgrounds[slot]}
                      />
                    ))}
                  </div>
                </section>

                <section className="SkylightAdmin-card">
                  <h3>{t('more.title')}</h3>
                  {this.switch('ernestdefoe-skylight.tag_accent', 'more.tag_accent')}
                  {this.switch('ernestdefoe-skylight.auto_solid', 'more.auto_solid')}
                </section>
              </div>
            </div>
            <div className="Form-group Form-controls">{this.submitButton()}</div>
          </Form>
        </div>
      </div>
    );
  }

  switch(key: string, label: string) {
    const value = this.setting(key);
    return (
      <Switch state={!!Number(value()) || value() === 'true'} onchange={(on: boolean) => value(on ? '1' : '0')}>
        <span>
          {t(`${label}`)}
          <small className="helpText">{t(`${label}_help`)}</small>
        </span>
      </Switch>
    );
  }

  defaults(): Look {
    let stored: any = {};
    try {
      stored = JSON.parse(this.setting('ernestdefoe-skylight.defaults')() || '{}');
    } catch (e) {
      stored = {};
    }
    return { ...BUILT_IN, ...sanitize(stored) };
  }

  setDefault(key: LookKey, value: any) {
    const look = { ...this.defaults(), [key]: value };
    // Store only what differs from the built-in look.
    const diff: any = {};
    for (const [k, v] of Object.entries(sanitize(look))) if ((BUILT_IN as any)[k] !== v) diff[k] = v;
    this.setting('ernestdefoe-skylight.defaults')(JSON.stringify(diff));
  }

  openSections(): string[] {
    const raw = this.setting('ernestdefoe-skylight.sections')();
    try {
      const list = raw ? JSON.parse(raw) : null;
      return Array.isArray(list) ? list : Object.keys(SECTIONS);
    } catch (e) {
      return Object.keys(SECTIONS);
    }
  }

  toggleSection(section: string, on: boolean) {
    const list = this.openSections().filter((s) => s !== section);
    if (on) list.push(section);
    this.setting('ernestdefoe-skylight.sections')(JSON.stringify(Object.keys(SECTIONS).filter((s) => list.includes(s))));
  }

  contrastReadout(look: Look) {
    const c = accents(look.accent);
    const ratio = (n: number) => n.toFixed(1) + ' : 1';
    return (
      <p className="SkylightAdmin-contrast">
        <span>{t('defaults.contrast_light', { ratio: ratio(contrast(c.light, '#f4f7fa')) })}</span>
        <span>{t('defaults.contrast_dark', { ratio: ratio(contrast(c.dark, '#161c27')) })}</span>
        {c.nudged && <span className="nudged">{app.translator.trans('ernestdefoe-skylight.lib.help.nudged')}</span>}
      </p>
    );
  }
}
