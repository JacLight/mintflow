import { countries_translations } from './countries_translations';
import { countries } from './countries';
import { languages } from './languages';
import { countries_subdivisions } from './countries_subdivisions';

export function search_country(query: {
  id?: string;
  alpha2?: string;
  alpha3?: string;
}) {
  // if argument is not valid return false
  if (
    undefined === query.id &&
    undefined === query.alpha2 &&
    undefined === query.alpha3
  )
    return undefined;

  // iterate over the array of countries
  return countries_translations
    .filter(function (country: any) {
      // return country's data if
      return (
        // we are searching by ID and we have a match
        (undefined !== query.id &&
          parseInt(country.id, 10) === parseInt(query.id, 10)) ||
        // or we are searching by alpha2 and we have a match
        (undefined !== query.alpha2 &&
          country.alpha2 === query.alpha2.toLowerCase()) ||
        // or we are searching by alpha3 and we have a match
        (undefined !== query.alpha3 &&
          country.alpha3 === query.alpha3.toLowerCase())
      );

      // since "filter" returns an array we use pop to get just the data object
    })
    .pop();
}

export const getCountryRegions = (
  countryCode: string
): { label: string; value: string }[] => {
  if (!countryCode) return [];
  if (countryCode == 'all') return countries_subdivisions.map(item => ({ label: item.name, value: item.name, country: item.country.toLowerCase() }));
  const regions = countries_subdivisions
    .filter(item => item.country.toLowerCase() === countryCode?.toLowerCase())
    .map(item => ({ label: item.name, value: item.name }));
  return regions;
};

export const getCountryDropDownOptions = (): {
  label: string;
  value: string;
}[] => {
  const temp: any = countries;
  const tempArray = Object.keys(countries).map(key => {
    const country = temp[key];
    return { label: country.name, value: key.toLowerCase() };
  });
  return tempArray;
};

export const getCurrencies = (): string[] => {
  const tempArray = Object.values(countries)
    .filter(country => country.currency.length > 0)
    .map(country => country.currency[0]);
  return Array.from(new Set(tempArray));
};

export const getLanguages = (): { value: string; label: string }[] => {
  const tempArray = Object.values(countries)
    .filter(country => country.languages.length > 0)
    .map(country => country.languages[0]);
  const dedupArray = Array.from(new Set(tempArray));
  return dedupArray.map((item: string) => {
    let langName = languages[item]
      ? languages[item].name + ' - ' + item.toUpperCase()
      : item.toUpperCase();
    return { value: item, label: langName };
  });
};
