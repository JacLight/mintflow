import React from 'react';
// Export styling components and utilities
export { StyledComponent } from './styling';
export { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { ButtonElement } from './button-element';
import { CodeElement } from './code-element';
import { ColorElement } from './color-element';
import { CronElement } from './cron-element';
import { DateElement } from './date-element';
import { FileElement } from './file-element';
import { IconPickerElement } from './icon-picker-element';
import { LabelElement } from './label-element';
import { MapElementNew } from './map-element-new';
import { MarkdownElement } from './markdown-element';
import { NumberElement } from './number-element';
import { NumberRangeElement } from './number-range-element';
import { ParagraphElement } from './paragraph-element';
import { PreviewElement } from './preview-element';
import { RichtextElement } from './richtext-element';
import { SelectManyElement } from './select-many-element';
import { SelectSingleElement } from './select-single-element';
import { TextElement } from './text-element';
import { UuidElement } from './uuid-element';
import { PhoneElement } from './phone';
import { RatingInput } from './rating';
import { RankingInput } from './ranking';
import { GeneratedElement } from './generated-element';
import { SocialLinksElement } from './social-links';
import { LegalConsentElement } from './legal-concent';
import { DateRangeElement } from './date-range';
import { DataViewElement } from './data-view-element';
import { DataLookupCombo } from './data-lookup-combo';
import { ShadowElement } from './shadow-element';
import { FontPickerElement } from './font-picker-element';

export * from './color-element';
export * from './code-element';
export * from './number-element';
export * from './paragraph-element';
export * from './richtext-element';
export * from './select-many-element';
export * from './select-single-element';
export * from './text-element';
export * from './file-element';
export * from './uuid-element';
export * from './date-element';
export * from './map-element-new';
export * from './button-element';
export * from './label-element';
export * from './cron-element';
export * from './icon-picker-element';
export * from './markdown-element';
export * from './preview-element';
export * from './number-range-element';
export * from './phone';
export * from './date-range';
export * from './data-view-element';
export * from './rating';
export * from './ranking';
export * from './generated-element';
export * from './social-links';
export * from './legal-concent';
export * from './data-lookup-combo';
export * from './shadow-element';
export * from './font-picker-element';

// Use a more generic type to avoid TypeScript errors with prop interfaces
export const elementToNameMap: Record<string, React.ComponentType<any>> = {
  dataview: DataViewElement,
  text: TextElement,
  textarea: TextElement,
  number: NumberElement,
  shadow: ShadowElement,
  file: FileElement,
  selectsingle: SelectSingleElement,
  selectmany: SelectManyElement,
  richtext: RichtextElement,
  paragraph: ParagraphElement,
  code: CodeElement,
  date: DateElement,
  daterange: DateRangeElement,
  color: ColorElement,
  uuid: UuidElement,
  map: MapElementNew,
  button: ButtonElement,
  label: LabelElement,
  cron: CronElement,
  phone: PhoneElement,
  icon: IconPickerElement,
  markdown: MarkdownElement,
  preview: PreviewElement,
  numberrange: NumberRangeElement,
  address: NumberRangeElement,
  rating: RatingInput,
  ranking: RankingInput,
  generated: GeneratedElement,
  sociallinks: SocialLinksElement,
  legalconsent: LegalConsentElement,
  lookup: DataLookupCombo,
  font: FontPickerElement,
  default: ({ name }) => <div>Unknown element {name}</div>,
};
