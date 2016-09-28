interface ConfigValue<T> {
  required: boolean;
  default: T;
  loader: (value: string) => T;
  value: T;
}

const Config = {
  HACKBOT_API_URL: <ConfigValue<string>> {
    required: true,
  },
  HACKBOT_API_PASSWORD: <ConfigValue<string>> {
    required: true,
  },
  HACKBOT_ERROR_CHANNEL: <ConfigValue<string>> {
    required: false,
    default: '#hackbot-errors',
  },
  HACKBOT_ADMIN_USERS: <ConfigValue<string[]>> {
    required: false,
    default: [],
    loader: (value: string) => value.split(','),
    value: <string[]> undefined,
  },
};

function loadEnv<T>(name: string, env: ConfigValue<T>, errorReporter: (msg: string) => void) {
  const value = process.env[name];
  if (value !== undefined) {
    if (env.loader !== undefined) {
      env.value = env.loader(value);
    } else {
      env.value = <any> value;
    }
  } else {
    if (env.required) {
      return errorReporter(`Environment variable ${name} is required`);
    }
    env.value = env.default;
  }
}

export function loadConfig(errorReporter: (msg: string) => void) {
  Object.keys(Config).forEach(key => loadEnv(key, (<any> Config)[key], errorReporter));
}

export default Config;
