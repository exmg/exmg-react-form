import React, { Component } from 'react';

export interface FormValues {
  [key: string]: any;
}

export interface FormProps {
  children: JSX.Element | string | (JSX.Element | string)[];
  onSubmit: (values: FormValues) => Promise<any>;
  onSend?: (sending: boolean) => any;
}

export interface FormState {
  errors: { [key: string]: string };
  sending:  boolean;
  values: { [key: string]: any };
}

export interface FormContext {
  // values: FormValues;
  // errors: { [key: string]: string };
  register: (component: any) => void;
  unregister: (component: any) => void;
  serialize: () => FormValues;
}

const Context = React.createContext({} as FormContext);

export const FormConsumer = Context.Consumer;

export default class Form extends Component<FormProps, FormState> {
  state = {
    errors: {},
    sending: false,
    values: {},
  };

  components: { [key: string]: any } = {};

  _context = {
    register: this.register.bind(this),
    unregister: this.unregister.bind(this),
    serialize: this.serialize.bind(this),
  };

  register(component: any) {
    const { name } = component.props;

    if (this.components[name]) {
      // Does it, what about form groups like radio input?
      setTimeout(() => {
        throw Error(`Form name "${name}" must be unique`);
      }, 0);
    }

    this.components[name] = component;
  }

  unregister(component: any) {
    const { name } = component.props;

    if (!this.components[name]) {
      throw Error(`Form name "${name}" not found`);
    }

    delete this.components[name];
  }

  onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    this.submit();
  }

  /**
   * Public api to submit form
   */
  public submit(): void {
    if (!this.validate()) {
      console.log('Validation error');
      return;
    }

    const formData = this.serialize();
    const promise = this.props.onSubmit(formData);

    if (!promise || !promise.then) {
      // eslint-disable-next-line
      return console.warn('Expected onSubmit to return a promise');
    }

    this.setSending(true);

    promise
      .then(
        () => this.setSending(false),
        (errors) => {
         // this.setErrors(errors);
         this.setSending(false);
        },
      );
  }

  setSending(sending: boolean) {
    const { onSend } = this.props;

    this.setState({
      sending,
    });

    if(onSend) {
      onSend(sending);
    }
  }

  serialize(): FormValues {
    const formData: FormValues = {};

    Object.values(this.components).forEach((component: any) => {
      formData[component.props.name] = component.getValue();
    });

    return formData;
  }

  validate() {
    let isValid = true;

    Object.values(this.components).forEach((component) => {
      if(!component.validate()) {
        isValid = false;
      }
    });

    return isValid;
  }

  render() {
    const { children } = this.props;

    return (
      <Context.Provider value={ this._context }>
        <form onSubmit={ this.onSubmit }>
          { children }
        </form>
      </Context.Provider>
    );
  }
}
