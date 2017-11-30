import React from 'react';
import { FormGroup, FormArray, FormControl } from './model';
import { isReactNative } from './utils';

// React
const propsToBeMap = {
  value: 'value',
  touched: 'touched',
  untouched: 'untouched',
  disabled: 'disabled',
  enabled: 'enabled',
  invalid: 'invalid',
  valid: 'valid',
  pristine: 'pristine',
  dirty: 'dirty',
  errors: 'errors',
  hasError: 'hasError',
  status: 'status',
}
const controlsToBeMap = {
  ReactNative: {
    value: 'value',
    onChange: 'onChange',
    onBlur: 'onBlur',
    editable: 'enabled',
    disabled: 'disabled',
  },
  default: {
    value: 'value',
    onChange: 'onChange',
    onBlur: 'onBlur',
    disabled: 'disabled',
  }
}
const inputControls = isReactNative() ? controlsToBeMap.ReactNative : controlsToBeMap.default;
/**
* @param {FormControl|FormGroup} control
*/
function mapControlToProps(control) {
  const mappedObject = {};
  const controlObject = {};
  Object.keys(propsToBeMap).forEach((key) => {
    const controlProperty = control[propsToBeMap[key]];
    mappedObject[key] = controlProperty;
  });
  if(control instanceof FormControl) {
    Object.keys(inputControls).forEach((key) => {
      const controlProperty = control[inputControls[key]];
      controlObject[key] = controlProperty;
    });
    mappedObject['handler'] = controlObject;
  }
  return mappedObject;
}
/**
* @param {FormControl|FormGroup} control
* @param {String} name
*/
function mapNestedControls(control, name) {
  var extraProps = {};
  extraProps[name] = mapControlToProps(control);
  if(control instanceof FormGroup|FormArray && control.controls) {
    Object.keys(control.controls).forEach((childControlName) => {
      // extraProps[controlName+'.'+childControlName] = mapControlToProps(control.controls[childControlName]);
      extraProps = Object.assign(extraProps, mapNestedControls(control.controls[childControlName], name+'.'+childControlName));
    })
  }
  return extraProps;
}
function mapProps(formControls) {
  let extraProps = {};
  if (formControls) {
    Object.keys(formControls).forEach((controlName) => {
      const control = formControls[controlName];
      if (control) {
        extraProps = Object.assign(extraProps, mapNestedControls(control, controlName));
      }
    });
  }
  return extraProps;
}
/**
 * Higher order component
 * @param {Component} ReactComponent
 * @param {FormGroup} formGroup
 * @return {Component} connect
 */
function connect(ReactComponent, formGroup) {
  console.log("CONNECT IS GETTING CALLED")
  const formControls = formGroup.controls;
  const extraProps = mapProps(formControls);
  mapProps(formControls);
  class Connect extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        extraProps
      };
      this.updateComponent = this.updateComponent.bind(this);
    }
    componentDidMount() {
      // Add listeners
      formGroup.updateDOM.subscribe(() => {
        // if (this.myForm) {
          this.updateComponent();
        // }
      }, (error) => {
        console.log(error);
      });
      // formGroup.statusChanges.subscribe(() => {
      //     this.updateComponent();
      // }, (error) => {
      //   console.log(error);
      // });
      // formGroup.valueChanges.subscribe(() => {
      //     this.updateComponent();
      // }, (error) => {
      //   console.log(error);
      // });
    }
    componentWillUnmount() {
      //Remove listeners
      if (formGroup.updateDOM.observers) {
        formGroup.updateDOM.observers.forEach((observer) => {
          observer.unsubscribe();
        });
      }
      // if (formGroup.statusChanges.observers) {
      //   formGroup.statusChanges.observers.forEach((observer) => {
      //     observer.unsubscribe();
      //   });
      // }
      // if (formGroup.valueChanges.observers) {
      //   formGroup.valueChanges.observers.forEach((observer) => {
      //     observer.unsubscribe();
      //   });
      // }
    }
    updateComponent() {
      this.setState({
        extraProps: mapProps(formControls)
      });
    }
    render() {
      const props = Object.assign({}, this.props, this.state.extraProps);
      return React.createElement(ReactComponent, props);
    }
}
  return Connect;
}
export default connect;
