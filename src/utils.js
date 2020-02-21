export default {
  arraysDiffer(a, b) {
    let isDifferent = false;
    if (a.length !== b.length) {
      isDifferent = true;
    } else {
      a.forEach((item, index) => {
        if (!this.isSame(item, b[index])) {
          isDifferent = true;
        }
      }, this);
    }
    return isDifferent;
  },

  objectsDiffer(a, b) {
    let isDifferent = false;
    if (Object.keys(a).length !== Object.keys(b).length) {
      isDifferent = true;
    } else {
      Object.keys(a).forEach((key) => {
        if (!this.isSame(a[key], b[key])) {
          isDifferent = true;
        }
      }, this);
    }
    return isDifferent;
  },

  isSame(a, b) {
    if (typeof a !== typeof b) {
      return false;
    } else if (Array.isArray(a) && Array.isArray(b)) {
      return !this.arraysDiffer(a, b);
    } else if (typeof a === 'function') {
      return a.toString() === b.toString();
    } else if (typeof a === 'object' && a !== null && b !== null) {
      return !this.objectsDiffer(a, b);
    }

    return a === b;
  },

  find(collection, fn) {
    for (let i = 0, l = collection.length; i < l; i += 1) {
      const item = collection[i];
      if (fn(item)) {
        return item;
      }
    }
    return null;
  },

  runRules(value, currentValues, validations, validationRules) {
    const results = {
      errors: [],
      failed: [],
      success: [],
    };
    return Promise.all(Object.keys(validations).map((validationMethod) => {
      if (validationRules[validationMethod] && typeof validations[validationMethod] === 'function') {
        throw new Error(`Formsy does not allow you to override default validations: ${validationMethod}`);
      }

      if (!validationRules[validationMethod] && typeof validations[validationMethod] !== 'function') {
        throw new Error(`Formsy does not have the validation rule: ${validationMethod}`);
      }

      if (typeof validations[validationMethod] === 'function') {
        return Promise.resolve(validations[validationMethod](currentValues, value))
          .then((validation) => {
            if (typeof validation === 'string') {
              results.errors.push(validation);
              results.failed.push(validationMethod);
            } else if (!validation) {
              results.failed.push(validationMethod);
            }
          });
      } else if (typeof validations[validationMethod] !== 'function') {
        return Promise.resolve(validationRules[validationMethod](
          currentValues,
          value,
          validations[validationMethod],
        )).then((validation) => {
          if (typeof validation === 'string') {
            results.errors.push(validation);
            results.failed.push(validationMethod);
          } else if (!validation) {
            results.failed.push(validationMethod);
          } else {
            results.success.push(validationMethod);
          }
        });
      }
      results.success.push(validationMethod);
    }))
      .then(() => results);
  },
};
