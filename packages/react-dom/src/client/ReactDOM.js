import '../shared/checkReact';
import './ReactDOMClientInjection';

import {
  computeUniqueAsyncExpiration,
  findHostInstanceWithNoPortals,
  updateContainerAtExpirationTime,
  flushRoot,
  createContainer,
  updateContainer,
  batchedUpdates,
  unbatchedUpdates,
  interactiveUpdates,
  flushInteractiveUpdates,
  flushSync,
  flushControlled,
  injectIntoDevTools,
  getPublicRootInstance,
  findHostInstance,
  findHostInstanceWithWarning,
} from 'react-reconciler/inline.dom';

import {
  createPortal as createPortalImpl
} from 'shared/ReactPortal';
import {
  canUseDOM
} from 'shared/ExecutionEnvironment';
import {
  setBatchingImplementation
} from 'events/ReactGenericBatching';
import {
  setRestoreImplementation,
  enqueueStateRestore,
  restoreStateIfNeeded,
} from 'events/ReactControlledComponent';
import {
  injection as EventPluginHubInjection,
  runEventsInBatch,
} from 'events/EventPluginHub';
import {
  eventNameDispatchConfigs
} from 'events/EventPluginRegistry';
import {
  accumulateTwoPhaseDispatches,
  accumulateDirectDispatches,
} from 'events/EventPropagators';
import {
  has as hasInstance
} from 'shared/ReactInstanceMap';
import ReactVersion from 'shared/ReactVersion';
import ReactSharedInternals from 'shared/ReactSharedInternals';
import getComponentName from 'shared/getComponentName';
import invariant from 'shared/invariant';
import lowPriorityWarning from 'shared/lowPriorityWarning';
import warningWithoutStack from 'shared/warningWithoutStack';
import {
  enableStableConcurrentModeAPIs
} from 'shared/ReactFeatureFlags';

import {
  getInstanceFromNode,
  getNodeFromInstance,
  getFiberCurrentPropsFromNode,
  getClosestInstanceFromNode,
} from './ReactDOMComponentTree';
import {
  restoreControlledState
} from './ReactDOMComponent';
import {
  dispatchEvent
} from '../events/ReactDOMEventListener';
import {
  ELEMENT_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
} from '../shared/HTMLNodeType';
import {
  ROOT_ATTRIBUTE_NAME
} from '../shared/DOMProperty';

// ???
const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;

let topLevelUpdateWarnings;
let warnOnInvalidCallback;
let didWarnAboutUnstableCreatePortal = false;

// ???
setRestoreImplementation(restoreControlledState);

// react批量更新
function ReactBatch(root: ReactRoot) {
  const expirationTime = computeUniqueAsyncExpiration();
  this._expirationTime = expirationTime;
  this._root = root;
  this._next = null;
  this._callbacks = null;
  this._didComplete = false;
  this._hasChildren = false;
  this._children = null;
  this._defer = true;
}

ReactBatch.prototype.render = function (children: ReactNodeList) {
  this._hasChildren = true;
  this._children = children;
  const internalRoot = this._root._internalRoot;
  const expirationTime = this._expirationTime;
  const work = new ReactWork();

  updateContainerAtExpirationTime(
    children,
    internalRoot,
    null,
    expirationTime,
    work._onCommit,
  );

  return work
}

ReactBatch.prototype.then = function (onComplete: () => mixed) {
  if (this._didComplete) {
    onComplete();
    return;
  }
  let callbacks = this._callbacks;
  if (callbacks === null) {
    callbacks = this._callbacks = [];
  }
  callbacks.push(onComplete);
}

ReactBatch.prototype.commit = function () {
  const internalRoot = this._root._internalRoot;
  let firstBatch = internalRoot.firstBatch;

  // 当前没有需要改变的子组件
  if (!this._hasChildren) {
    this._next = null;
    this._defer = false;
    return;
  }

  let expirationTime = this._expirationTime;


  if (firstBatch !== this) {
    if (this._hasChildren) {
      expirationTime = this._expirationTime = firstBatch._expirationTime;
      this.render(this._children);
    }

    let previous = null;
    let batch = firstBatch;
    while (batch !== this) {
      previous = batch;
      batch = batch._next;
    }

    previous._next = batch._next;

    this._next = firstBatch;
    firstBatch = internalRoot.firstBatch = this;
  }

  this._defer = false;
  flushRoot(internalRoot, expirationTime);

  const next = this._next;
  this._next = null;
  firstBatch = internalRoot.firstBatch = next;

  if (firstBatch !== null && firstBatch._hasChildren) {
    firstBatch.render(firstBatch._children);
  }
};

ReactBatch.prototype._onComplete = function () {
  if (this._didComplete) {
    return;
  }
  this._didComplete = true;
  const callbacks = this._callbacks;
  if (callbacks === null) {
    return;
  }
  // TODO: Error handling.
  for (let i = 0; i < callbacks.length; i++) {
    const callback = callbacks[i];
    callback();
  }
};

type Work = {
  then(onCommit: () => mixed): void,
  _onCommit: () => void,
  _callbacks: Array < () => mixed > | null,
  _didCommit: boolean,
};

// react-work
function ReactWork() {
  this._callbacks = null;
  this._didCommit = false;
  // TODO: Avoid need to bind by replacing callbacks in the update queue with
  // list of Work objects.
  this._onCommit = this._onCommit.bind(this);
}
ReactWork.prototype.then = function (onCommit: () => mixed): void {
  if (this._didCommit) {
    onCommit();
    return;
  }
  let callbacks = this._callbacks;
  if (callbacks === null) {
    callbacks = this._callbacks = [];
  }
  callbacks.push(onCommit);
};
ReactWork.prototype._onCommit = function (): void {
  if (this._didCommit) {
    return;
  }
  this._didCommit = true;
  const callbacks = this._callbacks;
  if (callbacks === null) {
    return;
  }
  // TODO: Error handling.
  for (let i = 0; i < callbacks.length; i++) {
    const callback = callbacks[i];
    callback();
  }
};