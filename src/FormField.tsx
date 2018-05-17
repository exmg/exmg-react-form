import React, { Component } from 'react';
import Form, { FormConsumer, FormContext } from './Form';

export interface FormFieldProps {
  value: any;
  name: string;
  onChange: (value: any, prevValue?: any) => void;
  form: FormContext;
  required?: boolean;
  [key: string]: any;
}

export interface FormFieldState {
  dirty: boolean;
  error: string | boolean;
  touched: boolean;
  value: any;
}

export interface ValidateSignature {
  value: any;
  allValues: { [key: string]: any };
  props: FormFieldProps;
}

export interface Options {
  defaultValue: any;
  key?: string;
  validate?: (value: any, props: FormFieldProps, allValues: { [key: string]: any }) => boolean | string;
  warn?: (value: any, props: FormFieldProps, allValues: { [key: string]: any }) => boolean | string;
}

const defaults: Options = {
  defaultValue: null,
  key: 'value',
  validate: (data) => false,
  warn: (data) => false,
};

const withFormField = (options: Options) => (WrappedComponent: any): any => {
  const name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const config: Options = { ...defaults, ...options };

  class FormField extends Component<FormFieldProps, FormFieldState> {
    static displayName = `FormField(${name})`;

    state = {
      dirty: false,
      error: false,
      touched: false,
      value: (this.props[config.key] === undefined) ?  config.defaultValue : this.props[config.key],
    };

    // TODO Update state from props

    componentDidMount() {
      const { form } = this.props;

      form.register(this);
    }

    componentWillUnmount() {
      const { form } = this.props;

      form.unregister(this);
    }

    setValue = (value: any) => {
      const { name, value: prevValue, onChange } = this.props;

      this.setTouched(true);

      this.setState({
        value,
        dirty: this.state.dirty || (prevValue !== null && value !== prevValue),
      });

      if(typeof onChange === 'function') {
        onChange(value, prevValue);
      }
    }

    getValue() {
      return this.state.value;
    }

    validate() {
      const { serialize } = this.props.form;
      const validation = config.validate(this.state.value, this.props, serialize());

      if(typeof validation === 'string') {
        this.setError(validation);
        return false;
      }

      this.setError(false);
      return true;
    }

    setTouched = (touched: boolean) => {
			this.setState({ touched });
    }

    setError(error: string | boolean) {
      this.setState({
        error,
      });
    }

    render() {
      const { value, error } = this.state;

      return (
        <WrappedComponent
          { ...this.props }
          setValue={ this.setValue }
          value={ value }
          error={ error }
        />
      );
    }
  }

  const FormFieldWrapper = (props: FormFieldProps) => (
    <FormConsumer>
      { form => <FormField { ...props } form={ form } /> }
    </FormConsumer>
  );

  return FormFieldWrapper;
};

export { withFormField };
