# front-end

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Run your end-to-end tests
```
yarn test:e2e
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


### 代码规范

##### 初始配置
1.使用webStorm作为Ide

2.将vue组件的模板改为
```
    <template>
    #[[$END$]]#
    </template>
    
    <script lang="ts">
    import Vue from 'vue'
    export default Vue.extend({
        name: "${COMPONENT_NAME}",
        components: {},
        data (){
            return {}
        },
        props: {},
        computed: {},
        methods: {},
        watch: {},
    })
    </script>
    
    <style scoped>
    
    </style>
```
    3.在node_modules/vue/types/options.d.ts 中 
    将
    export type Accessors<T> = {
      [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
    }
    改为
    export type Accessors<T> = {
      [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]> | ((arg0: any) => T[K])
    }

##### 命名规范
    1.组件开头以不超过两个名字代表组件归属 例如 field${name}
    2.同类组件同前缀
    3.表示一组组件的可以放在同一文件夹中 允许二级目录
    4.组件变量命名均遵守camelCase规范
    !important 5.vue事件和Html元素规范是HTML也就是中线规范 eg. vue-test
    
##### 基础数据类
    1.
    2.Node, Link, Media分成Setting, Info两个大部分， 其中Setting可能有id相同的多个实例, Info则统一存在vuex中
    3.Content 分成Graph, Setting, Info三大部分， Graph.nodes下有一个节点Setting实例就是Graph本身
    
##### tips
See [Prop类型推测](https://stackoverflow.com/questions/54391162/typescript-wont-recognize-prop-values-on-vue-component)
d-flex 会使得v-show失效
    
##### vuex



package.json

