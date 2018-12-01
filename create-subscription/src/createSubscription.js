import React from 'react';
import invariant from 'shared/invariant';
import warningWithoutStack from 'shared/warningWithoutStack';

type Unsubscribe = () => void;
type Props = {
  children: (value: Value) => React$Element < any > ,
  source: Property,
};
type State = {
  source: Property,
  value: Value | void,
};

// 创建订阅的方法
export function createSubscription < Property, Value > (
  config: $ReadOnly < { |
    getCurrentValue: (source: Property) => Value | void,
    subscribe: (
      source: Property,
      callback: (value: Value | void) => void,
    ) => Unsubscribe,
    |
  } > ,
): React$ComponentType < {
  children: (value: Value | void) => React$Node,
  source: Property,
} > {
  const {
    getCurrentValue,
    subscribe
  } = config;


}