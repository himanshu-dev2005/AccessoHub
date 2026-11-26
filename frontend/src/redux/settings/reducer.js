import * as actionTypes from './types';

const DEFAULT_SETTINGS_STATE = {
  crm_settings: {},
  finance_settings: {},
  company_settings: {},
  app_settings: {},
  money_format_settings: {
    default_currency_code: 'INR',
    currency_symbol: '₹',
    currency_position: 'before',
    decimal_sep: '.',
    thousand_sep: ',',
    cent_precision: 2,
    zero_format: false,
  },
};

function loadCachedSettings() {
  try {
    const raw = window.localStorage.getItem('settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_SETTINGS_STATE,
          ...parsed,
          money_format_settings: {
            ...DEFAULT_SETTINGS_STATE.money_format_settings,
            ...(parsed.money_format_settings || {}),
          },
        };
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return null;
}

const cachedSettings = loadCachedSettings();

const INITIAL_STATE = {
  result: cachedSettings || DEFAULT_SETTINGS_STATE,
  isLoading: false,
  isSuccess: Boolean(cachedSettings),
};

const settingsReducer = (state = INITIAL_STATE, action) => {
  const { payload = null } = action;
  switch (action.type) {
    case actionTypes.RESET_STATE:
      return INITIAL_STATE;
    case actionTypes.REQUEST_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case actionTypes.REQUEST_FAILED:
      return {
        ...state,
        isLoading: false,
        isSuccess: false,
      };

    case actionTypes.UPDATE_CURRENCY:
      return {
        result: {
          ...state.result,
          money_format_settings: payload,
        },
        isLoading: false,
        isSuccess: true,
      };

    case actionTypes.REQUEST_SUCCESS:
      return {
        result: payload,
        isLoading: false,
        isSuccess: true,
      };
    default:
      return state;
  }
};

export default settingsReducer;
