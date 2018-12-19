# React源码解析
> cover reactJS 源码，fiber，Virtual DOM，Event model，renderer，reconciler，scheduler ...

## Plan

```

packages
├── create-subscription
│   ├── index.js
│   └── src
│       └── createSubscription.js
├── react
│   └── src
│       └── ReactBaseClasses.js
├── react-cache
│   ├── LRU.js
│   └── ReactCache.js
├── react-dom
│   ├── index.js
│   └── src
│       └── client
│           └── ReactDOM.js
├── react-reconciler
│   └── src
│       └── ReactUpdateQueue.js
└── shared
    └── ReactSharedInternals.js

```

## Article

- [this.setState发生了什么？](https://github.com/zero1five/react-unravel/blob/master/article/article_1.md)