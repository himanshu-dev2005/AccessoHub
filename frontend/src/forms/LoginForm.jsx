import { Form, Input, Checkbox } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';

export default function LoginForm() {
  const translate = useLanguage();
  return (
    <div>
      <Form.Item
        label={
          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>
            {translate('email')}
          </span>
        }
        name="email"
        rules={[
          {
            required: true,
          },
          {
            type: 'email',
          },
        ]}
      >
        <Input
          prefix={<MailOutlined style={{ color: '#64748B', marginRight: 4 }} />}
          type="email"
          size="large"
          autoComplete="off"
        />
      </Form.Item>
      <Form.Item
        label={
          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>
            {translate('password')}
          </span>
        }
        name="password"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#64748B', marginRight: 4 }} />}
          size="large"
          autoComplete="off"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ color: '#475569', fontWeight: 500 }}>
              {translate('Remember me')}
            </Checkbox>
          </Form.Item>
          <a
            className="login-form-forgot"
            href="/forgetpassword"
            style={{ color: '#2563EB', fontWeight: 600, fontSize: 13 }}
          >
            {translate('Forgot password')}
          </a>
        </div>
      </Form.Item>
    </div>
  );
}
