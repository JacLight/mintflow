# MintFlow Data Bridge Plugin

The Data Bridge plugin provides tools to transform and map data structures in your workflows. It allows you to easily convert data from one format to another, making it ideal for integrating different systems or APIs. It also includes comprehensive date and time manipulation capabilities.

## Features

### Data Transformation

- **Advanced Mapping**: Transform data from one structure to another using a mapping object
- **Transform Array**: Apply mapping transformations to each item in an array
- Support for nested properties using dot notation
- Custom function mapping for complex transformations

### Date and Time Utilities

- **Get Current Date**: Get the current date/time in various formats and timezones
- **Format Date**: Convert dates from one format to another
- **Extract Date Parts**: Extract components like year, month, day from a date
- **Date Difference**: Calculate the difference between two dates
- **Add/Subtract Date**: Add or subtract time from a date
- **Next Day of Week**: Find the next occurrence of a specific day of the week

## Installation

```bash
pnpm add @mintflow/data-bridge
```

## Usage

### Advanced Mapping

This action allows you to transform data from one structure to another using a mapping object.

```javascript
// Example usage in a workflow
const input = {
  data: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      zipCode: '12345'
    }
  }
};

const config = {
  data: {
    mapping: {
      name: 'firstName',
      surname: 'lastName',
      contactEmail: 'email',
      streetAddress: 'address.street',
      location: 'address.city',
      zip: 'address.zipCode'
    }
  }
};

const result = await dataBridge.advanced_mapping(input, config);

// Result:
// {
//   name: 'John',
//   surname: 'Doe',
//   contactEmail: 'john.doe@example.com',
//   streetAddress: '123 Main St',
//   location: 'Anytown',
//   zip: '12345'
// }
```

#### Using Dot Notation for Nested Properties

You can access nested properties using dot notation in your mapping:

```javascript
const mapping = {
  userCity: 'user.address.city',
  userZip: 'user.address.zipCode'
};
```

#### Using Function Mapping

For more complex transformations, you can use a function:

```javascript
const config = {
  data: {
    mapping: `function(data) {
      return {
        fullName: data.firstName + ' ' + data.lastName,
        contactInfo: {
          email: data.email,
          address: data.address.street + ', ' + data.address.city + ' ' + data.address.zipCode
        }
      };
    }`
  }
};
```

### Transform Array

This action allows you to apply mapping transformations to each item in an array.

```javascript
// Example usage in a workflow
const input = {
  data: {
    users: [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      }
    ]
  }
};

const config = {
  data: {
    sourceArray: 'users',
    mapping: {
      userId: 'id',
      name: 'firstName',
      surname: 'lastName',
      contactEmail: 'email'
    }
  }
};

const result = await dataBridge.transform_array(input, config);

// Result:
// {
//   transformedArray: [
//     {
//       userId: 1,
//       name: 'John',
//       surname: 'Doe',
//       contactEmail: 'john@example.com'
//     },
//     {
//       userId: 2,
//       name: 'Jane',
//       surname: 'Smith',
//       contactEmail: 'jane@example.com'
//     }
//   ]
// }
```

### Date and Time Utilities

#### Get Current Date

This action returns the current date and time in the specified format and timezone.

```javascript
const config = {
  data: {
    outputFormat: 'YYYY-MM-DD HH:mm:ss',
    outputTimezone: 'America/New_York'
  }
};

const result = await dataBridge.get_current_date(input, config);

// Result:
// {
//   ...input.data,
//   currentDate: '2025-02-27 17:15:00'
// }
```

#### Format Date

This action converts a date from one format to another.

```javascript
const input = {
  data: {
    someData: 'value'
  }
};

const config = {
  data: {
    inputDate: '2025-02-27 12:00:00',
    inputFormat: 'YYYY-MM-DD HH:mm:ss',
    inputTimezone: 'UTC',
    outputFormat: 'MMM DD, YYYY',
    outputTimezone: 'America/Los_Angeles'
  }
};

const result = await dataBridge.format_date(input, config);

// Result:
// {
//   someData: 'value',
//   formattedDate: 'Feb 27, 2025'
// }
```

#### Extract Date Parts

This action extracts specific parts from a date.

```javascript
const config = {
  data: {
    inputDate: '2025-02-27 12:00:00',
    inputFormat: 'YYYY-MM-DD HH:mm:ss',
    inputTimezone: 'UTC',
    dateParts: ['year', 'month', 'day', 'dayOfWeek', 'monthName']
  }
};

const result = await dataBridge.extract_date_parts(input, config);

// Result:
// {
//   ...input.data,
//   dateParts: {
//     year: 2025,
//     month: 2,
//     day: 27,
//     dayOfWeek: 4, // Thursday
//     monthName: 'February'
//   }
// }
```

#### Date Difference

This action calculates the difference between two dates.

```javascript
const config = {
  data: {
    date1: '2025-01-01',
    format1: 'YYYY-MM-DD',
    timezone1: 'UTC',
    date2: '2025-02-01',
    format2: 'YYYY-MM-DD',
    timezone2: 'UTC',
    unit: 'day'
  }
};

const result = await dataBridge.date_difference(input, config);

// Result:
// {
//   ...input.data,
//   difference: 31,
//   unit: 'day'
// }
```

#### Add/Subtract Date

This action adds or subtracts time from a date.

```javascript
const config = {
  data: {
    inputDate: '2025-02-27',
    inputFormat: 'YYYY-MM-DD',
    inputTimezone: 'UTC',
    amount: 7, // Use negative values to subtract
    unit: 'day',
    outputFormat: 'YYYY-MM-DD'
  }
};

const result = await dataBridge.add_subtract_date(input, config);

// Result:
// {
//   ...input.data,
//   resultDate: '2025-03-06'
// }
```

#### Next Day of Week

This action finds the next occurrence of a specific day of the week.

```javascript
const config = {
  data: {
    inputDate: '2025-02-27', // Thursday
    inputFormat: 'YYYY-MM-DD',
    inputTimezone: 'UTC',
    dayOfWeek: 1, // Monday
    outputFormat: 'YYYY-MM-DD'
  }
};

const result = await dataBridge.next_day_of_week(input, config);

// Result:
// {
//   ...input.data,
//   nextDate: '2025-03-03' // Next Monday
// }
```

## Example Workflow

```javascript
// Create a workflow that transforms data from an API
const workflow = {
  nodes: [
    {
      id: "start",
      type: "start",
      next: "fetch_data"
    },
    {
      id: "fetch_data",
      type: "fetch",
      action: "get",
      data: {
        url: "https://api.example.com/users"
      },
      next: "transform_data"
    },
    {
      id: "transform_data",
      type: "data-bridge",
      action: "transform_array",
      data: {
        sourceArray: "data",
        mapping: {
          id: "id",
          fullName: "name",
          email: "email",
          city: "address.city"
        }
      },
      next: "save_data"
    },
    {
      id: "save_data",
      type: "...",
      // Process the transformed data
    }
  ]
};
```

## License

MIT
