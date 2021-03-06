import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import { chain, find, trimEnd, uniqueId } from 'lodash';

const iconNames = require('@collab-ui/icons/data/iconNames.json');
const colors = require('@collab-ui/core/data/colors.json');

@Component({
  selector: 'cui-icon',
  template: `
    <button
      *ngIf="isClickable"
      class="{{ buttonClasses }}"
      [attr.aria-labelledby]="ariaLabelledBy"
      [attr.aria-label]="ariaLabel"
    >
      <i class="{{ classes }}" [style.color]="getColor()"></i>
    </button>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class IconComponent implements OnInit {
  @Input() public ariaLabel: string;
  @Input() public buttonClassName: string;
  @Input() public color: string;
  @Input() public className: string;
  @Input() public description: string;
  @Input() public name: string;
  @Input() public size: number;
  @Input() public fontSize: number;
  @Input() public title: string;
  @Input() public type: string;

  @Output() click: EventEmitter<any> = new EventEmitter();

  @HostBinding('class') get _class(): string {
    return !this.isClickable ? this.classes : '';
  }
  @HostBinding('style.color') get _color(): string {
    return !this.isClickable ? this.getColor() : '';
  }
  @HostBinding('attr.aria-labelledby') get _ariaLabelledBy(): string {
    return !this.isClickable ? this.ariaLabelledBy : '';
  }
  @HostBinding('attr.aria-label') get _ariaLabel(): string {
    return !this.isClickable ? this.ariaLabel : null;
  }

  public classes: string;
  public buttonClasses: string;
  public titleId: string;
  public descId: string;
  public isClickable: boolean;

  constructor() {}

  ngOnInit() {
    // input validations
    if (!this.name) {
      throw new Error('Attribute "name" is required');
    }
    if (this.type && this.type !== 'white' && this.type !== '') {
      throw new Error('Attribute "type" if defined is either "" or "white"');
    }

    this.isClickable = this.click.observers.length > 0;

    this.classes =
      'cui-icon icon' +
      `${(this.name && ` ${this.getIconNameClass()}`) || ''}` +
      `${(this.className && ` ${this.className}`) || ''}` +
      ``;

    this.buttonClasses =
      'cui-button cui-button--icon' +
      `${(this.type && ` cui-button--icon-${this.type}`) || ''}` +
      `${(this.buttonClassName && ` ${this.buttonClassName}`) || ''}` +
      ``;

    const iconCount = uniqueId();
    this.titleId = `icon-title-${iconCount}`;
    this.descId = this.description ? `icon-desc-${iconCount}` : undefined;
  }

  private getIconNameClass = () => {
    const defaultSize = 16;
    const sizeFromName = Number(this.name.split('_')[1]);

    let nameWithSize = this.name;
    if (sizeFromName && this.fontSize) {
      nameWithSize = `${this.name.split('_')[0]}_${this.fontSize}`;
    }
    if (!sizeFromName) {
      nameWithSize = `${this.name}_${this.size || defaultSize}`;
    }

    const lookupIconName = nameWithSize.replace(/^(icon-)/, '');
    const iconNameClass = `icon-${lookupIconName}`;

    // validate Icon name with Collab Toolkit
    if ((<any>iconNames).indexOf(lookupIconName) < 0) {
      this.consoleHandler('name-error', nameWithSize);
    }

    return iconNameClass;
  }

  private isolateRoot = str => {
    return chain(str)
      .trimStart('$')
      .split('-')
      .value()[0];
  }

  private getColorSpec = colorObj => {
    return colorObj.hex
      ? colorObj.hex
      : colorObj.opacity && this.isolateRoot(colorObj.variable) === 'white'
      ? `rgba(255, 255, 255, ${colorObj.opacity / 100})`
      : `rgba(0, 0, 0, ${colorObj.opacity / 100})`;
  }

  private getHexFromJSON = colorName => {
    for (const c of <any>colors) {
      const variation = find(c.variations, ['variable', colorName]);

      if (variation) {
        return this.getColorSpec(variation);
      }
    }

    return this.consoleHandler('color-error', colorName);
  }

  private formatColor() {
    return this.color.startsWith('$')
      ? this.color
      : this.color.endsWith('-base')
      ? trimEnd(this.color, '-base')
      : `$${this.color}`;
  }

  public getColor = () => {
    if (!this.color) {
      return '';
    }

    if (this.color.startsWith('#')) {
      this.consoleHandler('color-warn', this.color);
      return this.color;
    }
    return this.getHexFromJSON(this.formatColor());
  }

  public get ariaLabelledBy (): string {
    const { ariaLabel, title, description, titleId, descId } = this;

    if (!ariaLabel) {
      if (title && description) {
        return `${titleId} ${descId}`;
      }
      if (title) {
        return `${titleId}`;
      }
      if (description) {
        return `${descId}`;
      }
    }
    return null;
  }

  public consoleHandler = (message, data) => {
    switch (message) {
      case 'color-warn':
        console.warn(
          `[@collab-ui/angular] Icon: ${data} may not exist in the design system,` +
            ` please use a color name from http://collab-ui.cisco.com/styles/colors`
        );
        break;
      case 'color-error':
        console.warn(
          `[@collab-ui/angular] Icon: ${data} does not exist in the design system,` +
            ` please use a color name from http://collab-ui.cisco.com/styles/colors`
        );
        break;
      case 'name-error':
        console.warn(
          `[@collab-ui/angular] Icon: Icon ${data} does not exist in the design system.` +
            ` Visit https://icons.collab-ui.com for a list of available icons or to request a new icon.`
        );
        break;
    }
  }
}
