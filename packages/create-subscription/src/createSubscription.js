/**
 * createSubscription
 * 主要是创建一个能主动触发子组件渲染的父级组件
 * 通过subscribe重新setState => render
 */

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

  // 订阅组件
  class Subscription extends React.Component < Props,
  State > {
    state: State = {
      source: this.props.source,
      value: this.props.source != null ?
        getCurrentValue(this.props.source) : undefined,
    };

    _hasUnmounted: boolean = false;
    _unsubscribe: Unsubscribe | null = null;

    // 如果状态有更新就更新内部的state
    static getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.source !== prevState.source) {
        return {
          source: nextProps.source,
          value: nextProps.source != null ?
            getCurrentValue(nextProps.source) : undefined,
        };
      }

      return null;
    }

    // 组件挂载完成以后执行subscribe()
    componentDidMount() {
      this.subscribe();
    }

    // 在组件发生更新之后，如果source发生改变，则重新订阅
    componentDidUpdate(prevProps, prevState) {
      if (this.state.source !== prevState.source) {
        this.unsubscribe();
        this.subscribe();
      }
    }

    // 卸载订阅事件，改变hasUn状态
    componentWillUnmount() {
      this.unsubscribe();
      this._hasUnmounted = true;
    }

    render() {
      return this.props.children(this.state.value);
    }

    // 订阅方法
    subscribe() {
      const {
        source
      } = this.state;
      if (source != null) {
        const callback = (value: Value | void) => {
          // 组件已经卸载不需要再触发callback
          if (this._hasUnmounted) {
            return;
          }

          this.setState(state => {
            if (value === state.value) {
              return null;
            }

            if (source !== state.source) {
              return null;
            }

            // 都要发生改变，才会重新setState
            return {
              value
            };
          });
        };

        const unsubscribe = subscribe(source, callback);

        this._unsubscribe = unsubscribe;

        const value = getCurrentValue(this.props.source);
        if (value !== this.state.value) {
          this.setState({
            value
          });
        }
      }
    }

    // 卸载方法
    unsubscribe() {
      if (typeof this._unsubscribe === 'function') {
        this._unsubscribe();
      }
      this._unsubscribe = null;
    }

  }

  return Subscription
}