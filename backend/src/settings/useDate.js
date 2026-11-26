const useDate = ({ settings }) => {
  const dateFormat =
    settings?.accessohub_app_date_format || settings?.idurar_app_date_format || 'DD/MM/YYYY';

  return {
    dateFormat,
  };
};

module.exports = useDate;
