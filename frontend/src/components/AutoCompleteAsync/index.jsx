import { useState, useEffect, useRef } from 'react';

import { request } from '@/request';
import useOnFetch from '@/hooks/useOnFetch';
import useDebounce from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

import { Select, Empty } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function AutoCompleteAsync({
  entity,
  displayLabels,
  searchFields,
  outputValue = '_id',
  redirectLabel = 'Add New',
  withRedirect = false,
  urlToRedirect = '/',
  onQuickAdd,
  injectedOption,
  value,
  onChange,
}) {
  const translate = useLanguage();

  const addNewValue = { value: 'redirectURL', label: `+ ${translate(redirectLabel)}` };

  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);

  const isUpdating = useRef(true);

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  const navigate = useNavigate();

  const handleSelectChange = (newValue) => {
    isUpdating.current = false;
    if (newValue === 'redirectURL') {
      if (onQuickAdd) {
        onQuickAdd();
        return;
      }
      if (withRedirect) {
        navigate(urlToRedirect);
        return;
      }
    }
    setCurrentValue(newValue?.[outputValue] || newValue);
    if (onChange) {
      if (newValue) onChange(newValue[outputValue] || newValue);
      else onChange(undefined);
    }
  };

  const [, cancel] = useDebounce(
    () => {
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  const asyncSearch = async (options) => {
    return await request.search({ entity, options });
  };

  let { onFetch, result, isSuccess, isLoading } = useOnFetch();

  const labels = (optionField) => {
    return displayLabels.map((x) => optionField[x]).join(' ');
  };

  useEffect(() => {
    const options = {
      q: debouncedValue,
      fields: searchFields,
    };
    const callback = asyncSearch(options);
    onFetch(callback);

    return () => {
      cancel();
    };
  }, [debouncedValue]);

  const onSearch = (searchText) => {
    setSearching(true);
    setValToSearch(searchText);
  };

  useEffect(() => {
    if (isSuccess) {
      setOptions(result);
    } else {
      setSearching(false);
    }
  }, [isSuccess, result]);

  useEffect(() => {
    if (injectedOption && injectedOption[outputValue]) {
      setOptions((prev) => {
        const exists = prev.some((item) => item[outputValue] === injectedOption[outputValue]);
        return exists ? prev : [injectedOption, ...prev];
      });
      setCurrentValue(injectedOption[outputValue]);
    }
  }, [injectedOption, outputValue]);

  useEffect(() => {
    if (value && isUpdating.current) {
      setOptions([value]);
      setCurrentValue(value[outputValue] || value);
      onChange?.(value[outputValue] || value);
      isUpdating.current = false;
    } else if (typeof value === 'string' && value !== currentValue) {
      setCurrentValue(value);
    }
  }, [value]);

  return (
    <Select
      loading={isLoading}
      showSearch
      allowClear
      placeholder={translate('Search')}
      defaultActiveFirstOption={false}
      filterOption={false}
      notFoundContent={searching ? '... Searching' : <Empty />}
      value={currentValue}
      onSearch={onSearch}
      onClear={() => {
        setSearching(false);
        setCurrentValue(undefined);
      }}
      onChange={handleSelectChange}
      style={{ minWidth: '220px' }}
    >
      {selectOptions.map((optionField) => (
        <Select.Option
          key={optionField[outputValue] || optionField}
          value={optionField[outputValue] || optionField}
        >
          {labels(optionField)}
        </Select.Option>
      ))}
      {(withRedirect || onQuickAdd) && (
        <Select.Option value={addNewValue.value}>{addNewValue.label}</Select.Option>
      )}
    </Select>
  );
}
