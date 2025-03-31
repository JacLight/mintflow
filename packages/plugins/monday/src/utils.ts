import dayjs from 'dayjs';
import { MondayColumnType } from './constants.js';
import { ColumnValue, MondayColumn } from './models.js';

type ColumnIdTypeMap = {
    [key: string]: string;
};

/**
 * Generates a map of column IDs to column types
 */
export function generateColumnIdTypeMap(
    columns: MondayColumn[]
): ColumnIdTypeMap {
    const result: ColumnIdTypeMap = {};
    for (const column of columns) {
        result[column.id] = column.type;
    }
    return result;
}

/**
 * Converts a property value to the format expected by Monday.com API
 */
export function convertValueToMondayColumnValue(
    columnType: string,
    propValue: any
) {
    switch (columnType) {
        case MondayColumnType.CHECKBOX:
            return {
                checked: propValue ? 'true' : 'false',
            };
        case MondayColumnType.BOARD_RELATION:
        case MondayColumnType.DEPENDENCY:
            return {
                item_ids: JSON.parse(propValue as unknown as string),
            };
        case MondayColumnType.COUNTRY:
            return {
                countryCode: propValue.split('-')[0],
                countryName: propValue.split('-')[1],
            };
        case MondayColumnType.DATE: {
            let datevalue = dayjs(propValue as unknown as string);
            if (!datevalue.isValid()) {
                datevalue = dayjs();
            }
            return {
                date: datevalue.format('YYYY-MM-DD'),
                time: datevalue.format('HH:mm:ss'),
            };
        }
        case MondayColumnType.DROPDOWN:
            return {
                labels: propValue,
            };
        case MondayColumnType.EMAIL:
            return {
                email: propValue,
                text: propValue,
            };
        case MondayColumnType.HOUR: {
            const [hour, minute] = propValue.split(':');
            return {
                hour: Number(hour) ?? 0,
                minute: Number(minute) ?? 0,
            };
        }
        case MondayColumnType.LINK:
            return {
                url: propValue,
                text: propValue,
            };
        case MondayColumnType.LOCATION: {
            const [lat, lng, address] = propValue.split('|');
            return {
                lat: lat ?? '',
                lng: lng ?? '',
                address: address ?? '',
            };
        }
        case MondayColumnType.LONG_TEXT:
            return {
                text: propValue,
            };
        case MondayColumnType.NUMBERS:
            return String(propValue);
        case MondayColumnType.PEOPLE: {
            const res: { id: string; kind: string }[] = [];
            if (Array.isArray(propValue)) {
                propValue.forEach((person) => {
                    res.push({ id: person, kind: 'person' });
                });
            }
            return {
                personsAndTeams: res,
            };
        }
        case MondayColumnType.PHONE: {
            const [phone, countryCode] = propValue.split('-');
            return {
                phone: `+${phone}`,
                countryShortName: countryCode,
            };
        }
        case MondayColumnType.RATING:
            return {
                rating: Number(propValue),
            };
        case MondayColumnType.STATUS:
            return {
                label: propValue,
            };
        case MondayColumnType.TEXT:
            return propValue;
        case MondayColumnType.TIMELINE:
            return {
                from: propValue.split(';')[0],
                to: propValue.split(';')[1],
            };
        case MondayColumnType.WEEK:
            return {
                startDate: propValue.split(';')[0],
                endDate: propValue.split(';')[1],
            };
        case MondayColumnType.WORLD_CLOCK:
            return {
                timezone: propValue,
            };
        default:
            return null;
    }
}

/**
 * Parses a Monday.com column value into a more usable format
 */
export function parseMondayColumnValue(columnValue: ColumnValue) {
    if (!columnValue || !columnValue.type) {
        return null;
    }

    switch (columnValue.type) {
        case MondayColumnType.BUTTON:
            return columnValue.label;
        case MondayColumnType.CHECKBOX:
            return JSON.parse(columnValue.value)?.checked === 'true';
        case MondayColumnType.BOARD_RELATION:
            return columnValue.linked_item_ids ?? [];
        case MondayColumnType.DEPENDENCY:
            return JSON.parse(columnValue.linked_item_ids ?? '[]');
        case MondayColumnType.SUBTASKS: {
            const res: number[] = [];
            if (columnValue.value && columnValue.value !== '') {
                JSON.parse(columnValue.value).linkedPulseIds.map(
                    (item: { linkedPulseId: number }) => {
                        res.push(item.linkedPulseId);
                    }
                );
            }
            return res;
        }
        case MondayColumnType.COLOR_PICKER:
            return JSON.parse(columnValue.value)?.color?.hex ?? null;
        case MondayColumnType.COUNTRY:
            return JSON.parse(columnValue.value)?.countryName ?? null;
        case MondayColumnType.CREATION_LOG:
            return JSON.parse(columnValue.value)?.created_at ?? null;
        case MondayColumnType.DATE: {
            if (!columnValue.value || columnValue.value === '') {
                return null;
            }
            const dateTime = JSON.parse(columnValue.value);
            return `${dateTime.date} ${dateTime.time}`;
        }
        case MondayColumnType.DOC:
            return JSON.parse(columnValue.value)?.files[0]?.linkToFile ?? null;
        case MondayColumnType.DROPDOWN:
            return JSON.parse(columnValue.value)?.ids ?? [];
        case MondayColumnType.EMAIL:
            return JSON.parse(columnValue.value)?.email ?? null;
        case MondayColumnType.FILE:
            return columnValue.text;
        case MondayColumnType.HOUR: {
            if (!columnValue.value || columnValue.value === '') {
                return null;
            }
            const hourTime = JSON.parse(columnValue.value);
            return `${hourTime.hour}:${hourTime.minute}`;
        }
        case MondayColumnType.ITEM_ID:
            return JSON.parse(columnValue.value)?.item_id ?? null;
        case MondayColumnType.LAST_UPDATED:
            return JSON.parse(columnValue.value).updated_at;
        case MondayColumnType.LINK:
            return JSON.parse(columnValue.value)?.url ?? null;
        case MondayColumnType.LOCATION:
            return JSON.parse(columnValue.value)?.address ?? null;
        case MondayColumnType.LONG_TEXT:
            return JSON.parse(columnValue.value)?.text ?? null;
        case MondayColumnType.MIRROR:
            return null;
        case MondayColumnType.NUMBERS:
            return Number(JSON.parse(columnValue.value));
        case MondayColumnType.PEOPLE: {
            const people: number[] = [];
            if (columnValue.value && columnValue.value !== '') {
                JSON.parse(columnValue.value).personsAndTeams.map(
                    (item: { id: number; kind: string }) => {
                        people.push(item.id);
                    }
                );
            }
            return people;
        }
        case MondayColumnType.PHONE:
            return JSON.parse(columnValue.value)?.phone ?? null;
        case MondayColumnType.RATING:
            return JSON.parse(columnValue.value)?.rating ?? null;
        case MondayColumnType.STATUS:
            return columnValue.label;
        case MondayColumnType.TAGS:
            return columnValue.tags?.map((item: { name: string }) => item.name) ?? [];
        case MondayColumnType.TEXT:
            return JSON.parse(columnValue.value);
        case MondayColumnType.TIMELINE: {
            if (!columnValue.value || columnValue.value === '') {
                return null;
            }
            const timeline = JSON.parse(columnValue.value);
            return { from: timeline.from, to: timeline.to };
        }
        case MondayColumnType.TIME_TRACKING:
            return JSON.parse(columnValue.value)?.duration ?? null;
        case MondayColumnType.VOTE:
            return columnValue?.vote_count ?? 0;
        case MondayColumnType.WEEK: {
            return {
                startDate: columnValue.start_date,
                endDate: columnValue.end_date,
            };
        }
        case MondayColumnType.WORLD_CLOCK:
            return JSON.parse(columnValue.value)?.timezone ?? null;
        default:
            return null;
    }
}

/**
 * Checks if a value is empty
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}
