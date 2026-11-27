import { Form, Input, Checkbox } from 'antd';
import { Mail, Lock } from 'lucide-react';
import useLanguage from '@/locale/useLanguage';

export default function LoginForm() {
  const translate = useLanguage();
  return (
    <div className="space-y-3">
      <Form.Item
        label={
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {translate('email')}
          </span>
        }
        name="email"
        rules={[
          {
            required: true,
            message: 'Please enter your email',
          },
          {
            type: 'email',
            message: 'Please enter a valid email',
          },
        ]}
      >
        <Input
          prefix={<Mail className="w-4 h-4 text-zinc-400 mr-2" />}
          type="email"
          size="large"
          placeholder="admin@accessohub.com"
          className="rounded-lg text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500"
          autoComplete="off"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {translate('password')}
          </span>
        }
        name="password"
        rules={[
          {
            required: true,
            message: 'Please enter your password',
          },
        ]}
      >
        <Input.Password
          prefix={<Lock className="w-4 h-4 text-zinc-400 mr-2" />}
          size="large"
          placeholder="••••••••"
          className="rounded-lg text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500"
          autoComplete="off"
        />
      </Form.Item>

      <div className="flex items-center justify-between text-xs pt-1 pb-2">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox className="text-zinc-600 dark:text-zinc-400">
            {translate('Remember me')}
          </Checkbox>
        </Form.Item>
        <a
          href="/forgetpassword"
          className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {translate('Forgot password')}
        </a>
      </div>
    </div>
  );
}
