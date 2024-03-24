//test DynamicScroller

Vue.use({install:function(Vue){
  const vScrollerMixin = {
    props:{
      items: {
        type: Array,
        required: true,
      },
      keyField: {
        type: String,
        default: 'id',
      },
      direction: {
        type: String,
        default: 'vertical',
        validator: (value) => ['vertical', 'horizontal'].includes(value),
      },
      listTag: {
        type: String,
        default: 'div',
      },
      itemTag: {
        type: String,
        default: 'div',
      },
    },
    computed: {
      simpleArray () {
        return this.items.length && typeof this.items[0] !== 'object'
      }
    }
  };
  let uid = 0;
  Vue.component('RecycleScroller',{
    components: {
      ResizeObserver:Vue.component('ResizeObserver', {
        //https://github.com/Akryum/vue-resize
        template:`<div class="resize-observer" tabindex="-1"/>`,
        props: {
          emitOnMount: {type: Boolean,default: false,},
          ignoreWidth: {type: Boolean,default: false,},
          ignoreHeight: {type: Boolean,default: false,},
        },
        created(){
          (function(id='ResizeObserver'){
            document.getElementById(id)?.remove();
            const el=Object.assign(document.createElement('style'),{type:'text/css',id});
            el.appendChild(document.createTextNode(`
              .resize-observer {
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1;
                width: 100%;
                height: 100%;
                border: none;
                background-color: transparent;
                pointer-events: none;
                display: block;
                overflow: hidden;
                opacity: 0;
              }
              .resize-observer >>> object {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                overflow: hidden;
                pointer-events: none;
                z-index: -1;
              }
            `));
            document.body.insertAdjacentElement('afterBegin',el);
          }());
        },
        mounted () {
          this.$nextTick(() => {
            this._w = this.$el.offsetWidth
            this._h = this.$el.offsetHeight
            if (this.emitOnMount) {
              this.emitSize()
            }
          })
          const object = document.createElement('object')
          this._resizeObject = object
          object.setAttribute('aria-hidden', 'true')
          object.setAttribute('tabindex', -1)
          object.onload = this.addResizeHandlers
          object.type = 'text/html'
          object.data = 'about:blank'
          this.$el.appendChild(object)
        },
        beforeDestroy () {
          this.removeResizeHandlers()
        },
        methods: {
          compareAndNotify () {
            if ((!this.ignoreWidth && this._w !== this.$el.offsetWidth) || (!this.ignoreHeight && this._h !== this.$el.offsetHeight)) {
              this._w = this.$el.offsetWidth
              this._h = this.$el.offsetHeight
              this.emitSize()
            }
          },
          emitSize () {
            this.$emit('notify', {
              width: this._w,
              height: this._h,
            })
          },
          addResizeHandlers () {
            this._resizeObject.contentDocument.defaultView.addEventListener('resize', this.compareAndNotify)
            this.compareAndNotify()
          },
          removeResizeHandlers () {
            if (this._resizeObject && this._resizeObject.onload) {
              if (this._resizeObject.contentDocument) {
                this._resizeObject.contentDocument.defaultView.removeEventListener('resize', this.compareAndNotify)
              }
              this.$el.removeChild(this._resizeObject)
              this._resizeObject.onload = null
              this._resizeObject = null
            }
          },
        },
      }),
    },
    directives: {
      ObserveVisibility: Vue.directive('observe-visibility', {
        //https://github.com/Akryum/vue-observe-visibility
        bind(el, { value }, vnode) {
          if (!value) return
          if (typeof IntersectionObserver === 'undefined') {
            console.warn('[vue-observe-visibility] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/w3c/IntersectionObserver/tree/master/polyfill')
          } else {
            class VisibilityState {
              constructor (el, options, vnode) {
                this.el = el
                this.observer = null
                this.frozen = false
                this.createObserver(options, vnode)
              }

              get threshold () {
                return this.options.intersection && typeof this.options.intersection.threshold === 'number' ? this.options.intersection.threshold : 0
              }

              createObserver (options, vnode) {
                if (this.observer) {
                  this.destroyObserver()
                }

                if (this.frozen) return
                function processOptions (value) {
                  let options
                  if (typeof value === 'function') {
                    // Simple options (callback-only)
                    options = {
                      callback: value,
                    }
                  } else {
                    // Options object
                    options = value
                  }
                  return options
                }
                this.options = processOptions(options)

                this.callback = (result, entry) => {
                  this.options.callback(result, entry)
                  if (result && this.options.once) {
                    this.frozen = true
                    this.destroyObserver()
                  }
                }
                // Throttle
                if (this.callback && this.options.throttle) {
                  const { leading } = this.options.throttleOptions || {}
                  function throttle (callback, delay, options = {}) {
                    let timeout
                    let lastState
                    let currentArgs
                    const throttled = (state, ...args) => {
                      currentArgs = args
                      if (timeout && state === lastState) return
                      let leading = options.leading
                      if (typeof leading === 'function') {
                        leading = leading(state, lastState)
                      }
                      if ((!timeout || (state !== lastState)) && leading) {
                        callback(state, ...currentArgs)
                      }
                      lastState = state
                      clearTimeout(timeout)
                      timeout = setTimeout(() => {
                        callback(state, ...currentArgs)
                        timeout = 0
                      }, delay)
                    }
                    throttled._clear = () => {
                      clearTimeout(timeout)
                      timeout = null
                    }
                    return throttled
                  }
                  this.callback = throttle(this.callback, this.options.throttle, {
                    leading: (state) => {
                      return leading === 'both' || (leading === 'visible' && state) || (leading === 'hidden' && !state)
                    },
                  })
                }

                this.oldResult = undefined

                this.observer = new IntersectionObserver(entries => {
                  let entry = entries[0]

                  if (entries.length > 1) {
                    const intersectingEntry = entries.find(e => e.isIntersecting)
                    if (intersectingEntry) {
                      entry = intersectingEntry
                    }
                  }

                  if (this.callback) {
                    // Use isIntersecting if possible because browsers can report isIntersecting as true, but intersectionRatio as 0, when something very slowly enters the viewport.
                    const result = entry.isIntersecting && entry.intersectionRatio >= this.threshold
                    if (result === this.oldResult) return
                    this.oldResult = result
                    this.callback(result, entry)
                  }
                }, this.options.intersection)

                // Wait for the element to be in document
                vnode.context.$nextTick(() => {
                  if (this.observer) {
                    this.observer.observe(this.el)
                  }
                })
              }

              destroyObserver () {
                if (this.observer) {
                  this.observer.disconnect()
                  this.observer = null
                }

                // Cancel throttled call
                if (this.callback && this.callback._clear) {
                  this.callback._clear()
                  this.callback = null
                }
              }
            }
            
            const state = new VisibilityState(el, value, vnode)
            el._vue_visibilityState = state
          }
        },
        update(el, { value, oldValue }, vnode) {
          function deepEqual (val1, val2) {
            if (val1 === val2) return true
            if (typeof val1 === 'object') {
              for (const key in val1) {
                if (!deepEqual(val1[key], val2[key])) {
                  return false
                }
              }
              return true
            }
            return false
          };
          if (deepEqual(value, oldValue)) return
          const state = el._vue_visibilityState
          if (!value) {
            unbind(el)
            return
          }
          if (state) {
            state.createObserver(value, vnode)
          } else {
            bind(el, { value }, vnode)
          }
        },
        unbind(el) {
          const state = el._vue_visibilityState
          if (state) {
            state.destroyObserver()
            delete el._vue_visibilityState
          }
        },
      }),
    },
    template:`<div
      v-observe-visibility="handleVisibilityChange"
      class="vue-recycle-scroller"
      :class="{
        ready,
        'page-mode': pageMode,
        ['direction-'+direction]: true,
      }"
      @scroll.passive="handleScroll"
    >
      <div
        v-if="$slots.before"
        ref="before"
        class="vue-recycle-scroller__slot"
      >
        <slot
          name="before"
        />
      </div>
      <component
        :is="listTag"
        ref="wrapper"
        :style="{ [direction === 'vertical' ? 'minHeight' : 'minWidth']: totalSize + 'px' }"
        class="vue-recycle-scroller__item-wrapper"
        :class="listClass"
      >
        <component
          :is="itemTag"
          v-for="view of pool"
          :key="view.nr.id"
          :style="ready ? {
            transform: 'translate' + (direction === 'vertical' ? 'Y' : 'X') + '(' + view.position + 'px) translate' + (direction === 'vertical' ? 'X' : 'Y') + '(' + view.offset + 'px)',
            width: gridItems ? (direction === 'vertical' ? itemSecondarySize || itemSize : itemSize) + 'px' : undefined,
            height: gridItems ? (direction === 'horizontal' ? itemSecondarySize || itemSize : itemSize) + 'px' : undefined,
          } : null"
          class="vue-recycle-scroller__item-view"
          :class="[
            itemClass,
            {
              hover: !skipHover && hoverKey === view.nr.key
            },
          ]"
          v-on="skipHover ? {} : {
            mouseenter: () => { hoverKey = view.nr.key },
            mouseleave: () => { hoverKey = null },
          }"
        >
          <slot
            :item="view.item"
            :index="view.nr.index"
            :active="view.nr.used"
          >{{view}}</slot>
        </component>

        <slot
          name="empty"
        />
      </component>

      <div
        v-if="$slots.after"
        ref="after"
        class="vue-recycle-scroller__slot"
      >
        <slot
          name="after"
        />
      </div>

      <ResizeObserver @notify="handleResize" />
    </div>`,
    mixins:[vScrollerMixin],
    props: {
      //...props,
      itemSize: {type: Number,default: null},
      gridItems: {type: Number,default: undefined},
      itemSecondarySize: {type: Number,default: undefined},
      minItemSize: {type: [Number, String],default: null},
      sizeField: {type: String,default: 'size'},
      typeField: {type: String,default: 'type'},
      buffer: {type: Number,default: 200},
      pageMode: {type: Boolean,default: false},
      prerender: {type: Number,default: 0},
      emitUpdate: {type: Boolean,default: false},
      skipHover: {type: Boolean,default: false},
      listTag: {type: String,default: 'div'},
      itemTag: {type: String,default: 'div'},
      listClass: {type: [String, Object, Array],default: ''},
      itemClass: {type: [String, Object, Array],default: ''},
    },
    data () {
      return {
        pool: [],
        totalSize: 0,
        ready: false,
        hoverKey: null,
      }
    },
    computed: {
      sizes () {
        if (this.itemSize === null) {
          const sizes = {
            '-1': { accumulator: 0 },
          }
          const items = this.items
          const field = this.sizeField
          const minItemSize = this.minItemSize
          let computedMinSize = 10000
          let accumulator = 0
          let current
          for (let i = 0, l = items.length; i < l; i++) {
            current = items[i][field] || minItemSize
            if (current < computedMinSize) {
              computedMinSize = current
            }
            accumulator += current
            sizes[i] = { accumulator, size: current }
          }
          // eslint-disable-next-line
          this.$_computedMinItemSize = computedMinSize
          return sizes
        }
        return []
      },
      //simpleArray,
    },
    watch: {
      items () {
        this.updateVisibleItems(true)
      },
      pageMode () {
        this.applyPageMode()
        this.updateVisibleItems(false)
      },
      sizes: {
        handler () {
          this.updateVisibleItems(false)
        },
        deep: true,
      },
      gridItems () {
        this.updateVisibleItems(true)
      },
      itemSecondarySize () {
        this.updateVisibleItems(true)
      },
    },
    created () {
      (function(id='RecycleScroller'){
        document.getElementById(id)?.remove();
        const el=Object.assign(document.createElement('style'),{type:'text/css',id});
        el.appendChild(document.createTextNode(`
          .vue-recycle-scroller {
            position: relative;
          }
          .vue-recycle-scroller.direction-vertical:not(.page-mode) {
            overflow-y: auto;
          }
          .vue-recycle-scroller.direction-horizontal:not(.page-mode) {
            overflow-x: auto;
          }
          .vue-recycle-scroller.direction-horizontal {
            display: flex;
          }
          .vue-recycle-scroller__slot {
            flex: auto 0 0;
          }
          .vue-recycle-scroller__item-wrapper {
            flex: 1;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
          }
          .vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
            position: absolute;
            top: 0;
            left: 0;
            will-change: transform;
          }
          .vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {
            width: 100%;
          }
          .vue-recycle-scroller.direction-horizontal .vue-recycle-scroller__item-wrapper {
            height: 100%;
          }
          .vue-recycle-scroller.ready.direction-vertical .vue-recycle-scroller__item-view {
            width: 100%;
          }
          .vue-recycle-scroller.ready.direction-horizontal .vue-recycle-scroller__item-view {
            height: 100%;
          }
        `));
        document.body.insertAdjacentElement('afterBegin',el);
      }());
      this.$_startIndex = 0
      this.$_endIndex = 0
      this.$_views = new Map()
      this.$_unusedViews = new Map()
      this.$_scrollDirty = false
      this.$_lastUpdateScrollPosition = 0
      // In SSR mode, we also prerender the same number of item for the first render
      // to avoir mismatch between server and client templates
      if (this.prerender) {
        this.$_prerender = true
        this.updateVisibleItems(false)
      }
      if (this.gridItems && !this.itemSize) {
        console.error('[vue-recycle-scroller] You must provide an itemSize when using gridItems')
      }
    },
    mounted () {
      this.applyPageMode()
      this.$nextTick(() => {
        // In SSR mode, render the real number of visible items
        this.$_prerender = false
        this.updateVisibleItems(true)
        this.ready = true
      })
    },
    activated () {
      const lastPosition = this.$_lastUpdateScrollPosition
      if (typeof lastPosition === 'number') {
        this.$nextTick(() => {
          this.scrollToPosition(lastPosition)
        })
      }
    },
    beforeDestroy () {
      this.removeListeners()
    },
    methods: {
      addView (pool, index, item, key, type) {
        const view = {
          item,
          position: 0,
        }
        const nonReactive = {
          id: uid++,
          index,
          used: true,
          key,
          type,
        }
        Object.defineProperty(view, 'nr', {
          configurable: false,
          value: nonReactive,
        })
        pool.push(view)
        return view
      },
      unuseView (view, fake = false) {
        const unusedViews = this.$_unusedViews
        const type = view.nr.type
        let unusedPool = unusedViews.get(type)
        if (!unusedPool) {
          unusedPool = []
          unusedViews.set(type, unusedPool)
        }
        unusedPool.push(view)
        if (!fake) {
          view.nr.used = false
          view.position = -9999
          this.$_views.delete(view.nr.key)
        }
      },
      handleResize () {
        this.$emit('resize')
        if (this.ready) this.updateVisibleItems(false)
      },
      handleScroll (event) {
        if (!this.$_scrollDirty) {
          this.$_scrollDirty = true
          requestAnimationFrame(() => {
            this.$_scrollDirty = false
            const { continuous } = this.updateVisibleItems(false, true)

            // It seems sometimes chrome doesn't fire scroll event :/
            // When non continous scrolling is ending, we force a refresh
            if (!continuous) {
              clearTimeout(this.$_refreshTimout)
              this.$_refreshTimout = setTimeout(this.handleScroll, 100)
            }
          })
        }
      },
      handleVisibilityChange (isVisible, entry) {
        if (this.ready) {
          if (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0) {
            this.$emit('visible')
            requestAnimationFrame(() => {
              this.updateVisibleItems(false)
            })
          } else {
            this.$emit('hidden')
          }
        }
      },
      updateVisibleItems (checkItem, checkPositionDiff = false) {
        const itemSize = this.itemSize
        const gridItems = this.gridItems || 1
        const itemSecondarySize = this.itemSecondarySize || itemSize
        const minItemSize = this.$_computedMinItemSize
        const typeField = this.typeField
        const keyField = this.simpleArray ? null : this.keyField
        const items = this.items
        const count = items.length
        const sizes = this.sizes
        const views = this.$_views
        const unusedViews = this.$_unusedViews
        const pool = this.pool
        let startIndex, endIndex
        let totalSize
        let visibleStartIndex, visibleEndIndex
        if (!count) {
          startIndex = endIndex = visibleStartIndex = visibleEndIndex = totalSize = 0
        } else if (this.$_prerender) {
          startIndex = visibleStartIndex = 0
          endIndex = visibleEndIndex = Math.min(this.prerender, items.length)
          totalSize = null
        } else {
          const scroll = this.getScroll()
          // Skip update if use hasn't scrolled enough
          if (checkPositionDiff) {
            let positionDiff = scroll.start - this.$_lastUpdateScrollPosition
            if (positionDiff < 0) positionDiff = -positionDiff
            if ((itemSize === null && positionDiff < minItemSize) || positionDiff < itemSize) {
              return {
                continuous: true,
              }
            }
          }
          this.$_lastUpdateScrollPosition = scroll.start
          const buffer = this.buffer
          scroll.start -= buffer
          scroll.end += buffer
          // account for leading slot
          let beforeSize = 0
          if (this.$refs.before) {
            beforeSize = this.$refs.before.scrollHeight
            scroll.start -= beforeSize
          }
          // account for trailing slot
          if (this.$refs.after) {
            const afterSize = this.$refs.after.scrollHeight
            scroll.end += afterSize
          }
          // Variable size mode
          if (itemSize === null) {
            let h
            let a = 0
            let b = count - 1
            let i = ~~(count / 2)
            let oldI
            // Searching for startIndex
            do {
              oldI = i
              h = sizes[i].accumulator
              if (h < scroll.start) {
                a = i
              } else if (i < count - 1 && sizes[i + 1].accumulator > scroll.start) {
                b = i
              }
              i = ~~((a + b) / 2)
            } while (i !== oldI)
            i < 0 && (i = 0)
            startIndex = i
            // For container style
            totalSize = sizes[count - 1].accumulator
            // Searching for endIndex
            for (endIndex = i; endIndex < count && sizes[endIndex].accumulator < scroll.end; endIndex++);
            if (endIndex === -1) {
              endIndex = items.length - 1
            } else {
              endIndex++
              // Bounds
              endIndex > count && (endIndex = count)
            }
            // search visible startIndex
            for (visibleStartIndex = startIndex; visibleStartIndex < count && (beforeSize + sizes[visibleStartIndex].accumulator) < scroll.start; visibleStartIndex++);
            // search visible endIndex
            for (visibleEndIndex = visibleStartIndex; visibleEndIndex < count && (beforeSize + sizes[visibleEndIndex].accumulator) < scroll.end; visibleEndIndex++);
          } else {
            // Fixed size mode
            startIndex = ~~(scroll.start / itemSize * gridItems)
            const remainer = startIndex % gridItems
            startIndex -= remainer
            endIndex = Math.ceil(scroll.end / itemSize * gridItems)
            visibleStartIndex = Math.max(0, Math.floor((scroll.start - beforeSize) / itemSize * gridItems))
            visibleEndIndex = Math.floor((scroll.end - beforeSize) / itemSize * gridItems)
            // Bounds
            startIndex < 0 && (startIndex = 0)
            endIndex > count && (endIndex = count)
            visibleStartIndex < 0 && (visibleStartIndex = 0)
            visibleEndIndex > count && (visibleEndIndex = count)
            totalSize = Math.ceil(count / gridItems) * itemSize
          }
        }
        if (endIndex - startIndex > 10000/*config.itemsLimit*/) {
          this.itemsLimitError()
        }
        this.totalSize = totalSize
        let view
        const continuous = startIndex <= this.$_endIndex && endIndex >= this.$_startIndex
        if (this.$_continuous !== continuous) {
          if (continuous) {
            views.clear()
            unusedViews.clear()
            for (let i = 0, l = pool.length; i < l; i++) {
              view = pool[i]
              this.unuseView(view)
            }
          }
          this.$_continuous = continuous
        } else if (continuous) {
          for (let i = 0, l = pool.length; i < l; i++) {
            view = pool[i]
            if (view.nr.used) {
              // Update view item index
              if (checkItem) {
                view.nr.index = items.indexOf(view.item)
              }

              // Check if index is still in visible range
              if (
                view.nr.index === -1 ||
                view.nr.index < startIndex ||
                view.nr.index >= endIndex
              ) {
                this.unuseView(view)
              }
            }
          }
        }
        const unusedIndex = continuous ? null : new Map()
        let item, type, unusedPool
        let v
        for (let i = startIndex; i < endIndex; i++) {
          item = items[i]
          const key = keyField ? item[keyField] : item
          if (key == null) {
            throw new Error(`Key is ${key} on item (keyField is '${keyField}')`)
          }
          view = views.get(key)
          if (!itemSize && !sizes[i].size) {
            if (view) this.unuseView(view)
            continue
          }
          // No view assigned to item
          if (!view) {
            if (i === items.length - 1) this.$emit('scroll-end')
            if (i === 0) this.$emit('scroll-start')
            type = item[typeField]
            unusedPool = unusedViews.get(type)
            if (continuous) {
              // Reuse existing view
              if (unusedPool && unusedPool.length) {
                view = unusedPool.pop()
                view.item = item
                view.nr.used = true
                view.nr.index = i
                view.nr.key = key
                view.nr.type = type
              } else {
                view = this.addView(pool, i, item, key, type)
              }
            } else {
              // Use existing view
              // We don't care if they are already used
              // because we are not in continous scrolling
              v = unusedIndex.get(type) || 0
              if (!unusedPool || v >= unusedPool.length) {
                view = this.addView(pool, i, item, key, type)
                this.unuseView(view, true)
                unusedPool = unusedViews.get(type)
              }
              view = unusedPool[v]
              view.item = item
              view.nr.used = true
              view.nr.index = i
              view.nr.key = key
              view.nr.type = type
              unusedIndex.set(type, v + 1)
              v++
            }
            views.set(key, view)
          } else {
            view.nr.used = true
            view.item = item
          }
          // Update position
          if (itemSize === null) {
            view.position = sizes[i - 1].accumulator
            view.offset = 0
          } else {
            view.position = Math.floor(i / gridItems) * itemSize
            view.offset = (i % gridItems) * itemSecondarySize
          }
        }
        this.$_startIndex = startIndex
        this.$_endIndex = endIndex
        if (this.emitUpdate) this.$emit('update', startIndex, endIndex, visibleStartIndex, visibleEndIndex)
        // After the user has finished scrolling
        // Sort views so text selection is correct
        clearTimeout(this.$_sortTimer)
        this.$_sortTimer = setTimeout(this.sortViews, 300)
        return {
          continuous,
        }
      },
      getListenerTarget () {
        let target = ScrollParent(this.$el)
        // Fix global scroll target for Chrome and Safari
        if (window.document && (target === window.document.documentElement || target === window.document.body)) {
          target = window
        }
        return target
      },
      getScroll () {
        const { $el: el, direction } = this
        const isVertical = direction === 'vertical'
        let scrollState
        if (this.pageMode) {
          const bounds = el.getBoundingClientRect()
          const boundsSize = isVertical ? bounds.height : bounds.width
          let start = -(isVertical ? bounds.top : bounds.left)
          let size = isVertical ? window.innerHeight : window.innerWidth
          if (start < 0) {
            size += start
            start = 0
          }
          if (start + size > boundsSize) {
            size = boundsSize - start
          }
          scrollState = {
            start,
            end: start + size,
          }
        } else if (isVertical) {
          scrollState = {
            start: el.scrollTop,
            end: el.scrollTop + el.clientHeight,
          }
        } else {
          scrollState = {
            start: el.scrollLeft,
            end: el.scrollLeft + el.clientWidth,
          }
        }
        return scrollState
      },
      applyPageMode () {
        if (this.pageMode) {
          this.addListeners()
        } else {
          this.removeListeners()
        }
      },
      addListeners () {
        this.listenerTarget = this.getListenerTarget()
        this.listenerTarget.addEventListener('scroll', this.handleScroll, false)
        this.listenerTarget.addEventListener('resize', this.handleResize)
      },
      removeListeners () {
        if (!this.listenerTarget) {
          return
        }
        this.listenerTarget.removeEventListener('scroll', this.handleScroll)
        this.listenerTarget.removeEventListener('resize', this.handleResize)
        this.listenerTarget = null
      },
      scrollToItem (index) {
        let scroll
        if (this.itemSize === null) {
          scroll = index > 0 ? this.sizes[index - 1].accumulator : 0
        } else {
          scroll = Math.floor(index / this.gridItems) * this.itemSize
        }
        this.scrollToPosition(scroll)
      },
      scrollToPosition (position) {
        const direction = this.direction === 'vertical'
          ? { scroll: 'scrollTop', start: 'top' }
          : { scroll: 'scrollLeft', start: 'left' }
        let viewport
        let scrollDirection
        let scrollDistance
        if (this.pageMode) {
          const viewportEl = ScrollParent(this.$el)
          // HTML doesn't overflow like other elements
          const scrollTop = viewportEl.tagName === 'HTML' ? 0 : viewportEl[direction.scroll]
          const bounds = viewportEl.getBoundingClientRect()
          const scroller = this.$el.getBoundingClientRect()
          const scrollerPosition = scroller[direction.start] - bounds[direction.start]
          viewport = viewportEl
          scrollDirection = direction.scroll
          scrollDistance = position + scrollTop + scrollerPosition
        } else {
          viewport = this.$el
          scrollDirection = direction.scroll
          scrollDistance = position
        }
        viewport[scrollDirection] = scrollDistance
      },
      itemsLimitError () {
        setTimeout(() => {
          console.log('It seems the scroller element isn\'t scrolling, so it tries to render all the items at once.', 'Scroller:', this.$el)
          console.log('Make sure the scroller has a fixed height (or width) and \'overflow-y\' (or \'overflow-x\') set to \'auto\' so it can scroll correctly and only render the items visible in the scroll viewport.')
        })
        throw new Error('Rendered items limit reached')
      },
      sortViews () {
        this.pool.sort((viewA, viewB) => viewA.nr.index - viewB.nr.index)
      },
    },
  });
  Vue.component('DynamicScroller',{
    template:`<RecycleScroller
      ref="scroller"
      :items="itemsWithSize"
      :min-item-size="minItemSize"
      :direction="direction"
      key-field="id"
      :list-tag="listTag"
      :item-tag="itemTag"
      v-bind="$attrs"
      @resize="onScrollerResize"
      @visible="onScrollerVisible"
      v-on="listeners"
    >
      <template slot-scope="{ item: itemWithSize, index, active }">
        <slot
          v-bind="{
            item: itemWithSize.item,
            index,
            active,
            itemWithSize
          }"
        />
      </template>
      <template slot="before">
        <slot name="before" />
      </template>
      <template slot="after">
        <slot name="after" />
      </template>
      <template slot="empty">
        <slot name="empty" />
      </template>
    </RecycleScroller>`,
    provide () {
      if (typeof ResizeObserver !== 'undefined') {
        this.$_resizeObserver = new ResizeObserver(entries => {
          requestAnimationFrame(() => {
            if (!Array.isArray(entries)) {
              return
            }
            for (const entry of entries) {
              if (entry.target) {
                const event = new CustomEvent(
                  'resize',
                  {
                    detail: {
                      contentRect: entry.contentRect,
                    },
                  },
                )
                entry.target.dispatchEvent(event)
              }
            }
          })
        })
      }
      return {
        vscrollData: this.vscrollData,
        vscrollParent: this,
        vscrollResizeObserver: this.$_resizeObserver,
      }
    },
    inheritAttrs: false,
    mixins:[vScrollerMixin],
    props: {
      //...props,
      minItemSize: {type: [Number, String],required: true},
    },
    data () {
      return {
        vscrollData: {
          active: true,
          sizes: {},
          validSizes: {},
          keyField: this.keyField,
          simpleArray: false,
        },
      }
    },
    computed: {
      //simpleArray,
      itemsWithSize () {
        const result = []
        const { items, keyField, simpleArray } = this
        const sizes = this.vscrollData.sizes
        const l = items.length
        for (let i = 0; i < l; i++) {
          const item = items[i]
          const id = simpleArray ? i : item[keyField]
          let size = sizes[id]
          if (typeof size === 'undefined' && !this.$_undefinedMap[id]) {
            size = 0
          }
          result.push({
            item,
            id,
            size,
          })
        }
        return result
      },
      listeners () {
        const listeners = {}
        for (const key in this.$listeners) {
          if (key !== 'resize' && key !== 'visible') {
            listeners[key] = this.$listeners[key]
          }
        }
        return listeners
      },
    },
    watch: {
      items () {
        this.forceUpdate(false)
      },
      simpleArray: {
        handler (value) {
          this.vscrollData.simpleArray = value
        },
        immediate: true,
      },
      direction (value) {
        this.forceUpdate(true)
      },
      itemsWithSize (next, prev) {
        const scrollTop = this.$el.scrollTop
        // Calculate total diff between prev and next sizes
        // over current scroll top. Then add it to scrollTop to
        // avoid jumping the contents that the user is seeing.
        let prevActiveTop = 0; let activeTop = 0
        const length = Math.min(next.length, prev.length)
        for (let i = 0; i < length; i++) {
          if (prevActiveTop >= scrollTop) {
            break
          }
          prevActiveTop += prev[i].size || this.minItemSize
          activeTop += next[i].size || this.minItemSize
        }
        const offset = activeTop - prevActiveTop
        if (offset === 0) {
          return
        }
        this.$el.scrollTop += offset
      },
    },
    beforeCreate () {
      this.$_updates = []
      this.$_undefinedSizes = 0
      this.$_undefinedMap = {}
    },
    activated () {
      this.vscrollData.active = true
    },
    deactivated () {
      this.vscrollData.active = false
    },
    methods: {
      onScrollerResize () {
        const scroller = this.$refs.scroller
        if (scroller) {
          this.forceUpdate()
        }
        this.$emit('resize')
      },
      onScrollerVisible () {
        this.$emit('vscroll:update', { force: false })
        this.$emit('visible')
      },
      forceUpdate (clear = true) {
        if (clear || this.simpleArray) {
          this.vscrollData.validSizes = {}
        }
        this.$emit('vscroll:update', { force: true })
      },
      scrollToItem (index) {
        const scroller = this.$refs.scroller
        if (scroller) scroller.scrollToItem(index)
      },
      getItemSize (item, index = undefined) {
        const id = this.simpleArray ? (index != null ? index : this.items.indexOf(item)) : item[this.keyField]
        return this.vscrollData.sizes[id] || 0
      },
      scrollToBottom () {
        if (this.$_scrollingToBottom) return
        this.$_scrollingToBottom = true
        const el = this.$el
        // Item is inserted to the DOM
        this.$nextTick(() => {
          el.scrollTop = el.scrollHeight + 5000
          // Item sizes are computed
          const cb = () => {
            el.scrollTop = el.scrollHeight + 5000
            requestAnimationFrame(() => {
              el.scrollTop = el.scrollHeight + 5000
              if (this.$_undefinedSizes === 0) {
                this.$_scrollingToBottom = false
              } else {
                requestAnimationFrame(cb)
              }
            })
          }
          requestAnimationFrame(cb)
        })
      },
    },
  });
  Vue.component('DynamicScrollerItem',{
    render (h) {
      return h(this.tag, this.$slots.default)
    },
    inject: ['vscrollData','vscrollParent','vscrollResizeObserver'],
    props: {
      item: {required: true},
      watchData: {type: Boolean,default: false},
      active: {type: Boolean,required: true},
      index: {type: Number,default: undefined},
      sizeDependencies: {type: [Array, Object],default: null},
      emitResize: {type: Boolean,default: false},
      tag: {type: String,default: 'div'},
    },
    computed: {
      id () {
        if (this.vscrollData.simpleArray) return this.index
        if (this.item.hasOwnProperty(this.vscrollData.keyField)) return this.item[this.vscrollData.keyField]
        throw new Error(`keyField '${this.vscrollData.keyField}' not found in your item. You should set a valid keyField prop on your Scroller`)
      },
      size () {
        return (this.vscrollData.validSizes[this.id] && this.vscrollData.sizes[this.id]) || 0
      },
      finalActive () {
        return this.active && this.vscrollData.active
      },
    },
    watch: {
      watchData: 'updateWatchData',
      id () {
        if (!this.size) {
          this.onDataUpdate()
        }
      },
      finalActive (value) {
        if (!this.size) {
          if (value) {
            if (!this.vscrollParent.$_undefinedMap[this.id]) {
              this.vscrollParent.$_undefinedSizes++
              this.vscrollParent.$_undefinedMap[this.id] = true
            }
          } else {
            if (this.vscrollParent.$_undefinedMap[this.id]) {
              this.vscrollParent.$_undefinedSizes--
              this.vscrollParent.$_undefinedMap[this.id] = false
            }
          }
        }
        if (this.vscrollResizeObserver) {
          if (value) {
            this.observeSize()
          } else {
            this.unobserveSize()
          }
        } else if (value && this.$_pendingVScrollUpdate === this.id) {
          this.updateSize()
        }
      },
    },
    created () {
      if (this.$isServer) return
      this.$_forceNextVScrollUpdate = null
      this.updateWatchData()
      if (!this.vscrollResizeObserver) {
        for (const k in this.sizeDependencies) {
          this.$watch(() => this.sizeDependencies[k], this.onDataUpdate)
        }
        this.vscrollParent.$on('vscroll:update', this.onVscrollUpdate)
        this.vscrollParent.$on('vscroll:update-size', this.onVscrollUpdateSize)
      }
    },
    mounted () {
      if (this.vscrollData.active) {
        this.updateSize()
        this.observeSize()
      }
    },
    beforeDestroy () {
      this.vscrollParent.$off('vscroll:update', this.onVscrollUpdate)
      this.vscrollParent.$off('vscroll:update-size', this.onVscrollUpdateSize)
      this.unobserveSize()
    },
    methods: {
      updateSize () {
        if (this.finalActive) {
          if (this.$_pendingSizeUpdate !== this.id) {
            this.$_pendingSizeUpdate = this.id
            this.$_forceNextVScrollUpdate = null
            this.$_pendingVScrollUpdate = null
            this.computeSize(this.id)
          }
        } else {
          this.$_forceNextVScrollUpdate = this.id
        }
      },
      updateWatchData () {
        if (this.watchData && !this.vscrollResizeObserver) {
          this.$_watchData = this.$watch('item', () => {
            this.onDataUpdate()
          }, {
            deep: true,
          })
        } else if (this.$_watchData) {
          this.$_watchData()
          this.$_watchData = null
        }
      },
      onVscrollUpdate ({ force }) {
        // If not active, sechedule a size update when it becomes active
        if (!this.finalActive && force) {
          this.$_pendingVScrollUpdate = this.id
        }
        if (this.$_forceNextVScrollUpdate === this.id || force || !this.size) {
          this.updateSize()
        }
      },
      onDataUpdate () {
        this.updateSize()
      },
      computeSize (id) {
        this.$nextTick(() => {
          if (this.id === id) {
            const width = this.$el.offsetWidth
            const height = this.$el.offsetHeight
            this.applySize(width, height)
          }
          this.$_pendingSizeUpdate = null
        })
      },
      applySize (width, height) {
        const size = ~~(this.vscrollParent.direction === 'vertical' ? height : width)
        if (size && this.size !== size) {
          if (this.vscrollParent.$_undefinedMap[this.id]) {
            this.vscrollParent.$_undefinedSizes--
            this.vscrollParent.$_undefinedMap[this.id] = undefined
          }
          this.$set(this.vscrollData.sizes, this.id, size)
          this.$set(this.vscrollData.validSizes, this.id, true)
          if (this.emitResize) this.$emit('resize', this.id)
        }
      },
      observeSize () {
        if (!this.vscrollResizeObserver || !this.$el.parentNode) return
        this.vscrollResizeObserver.observe(this.$el.parentNode)
        this.$el.parentNode.addEventListener('resize', this.onResize)
      },
      unobserveSize () {
        if (!this.vscrollResizeObserver) return
        this.vscrollResizeObserver.unobserve(this.$el.parentNode)
        this.$el.parentNode.removeEventListener('resize', this.onResize)
      },
      onResize (event) {
        const { width, height } = event.detail.contentRect
        this.applySize(width, height)
      },
    },
  });
}});


ENGINEER_TASKS.LISTS.B2C_WFM.tasksListComponent=Vue.component('CMTasks',{
  template:`<div style="height: calc(100vh - 226px);overflow: hidden;display: flex;flex-direction: column;">
    <DynamicScroller v-bind="{minItemSize:8,items}">
      <template slot-scope="{item,index,active}">
        <DynamicScrollerItem v-bind="{
          item,
          active,
          dataIndex:index,
          dataActive:active,
          sizeDependencies:[ item.type, item.id ]
        }">
          
          <div v-if="item.type=='title' && item.data.count" class="display-flex align-items-center gap-4px padding-8px">
            <span class="font--15-600 tone-500 white-space-pre">{{item.data.name}}: {{item.data.count}}</span>
          </div>
          
          <div v-else-if="item.type=='divider'" class="divider-line"/>
          
          <CMTaskCard v-else-if="item.type=='task'" :taskID="item.data.taskID"/>
          
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>`,
  computed:{
    ...mapGetters('cm',['tasksFiltered']),
    chunks(){return WFM.chunks(this.tasksFiltered)},
    items(){
      return this.chunks.map(statusChunk=>{
        const {name,count,slots}=statusChunk;
        return [
          ...count?[{id:name,type:'title',data:{name,count}}]:[],
          ...Object.entries(slots).map(([slotTime,slot],si)=>{
            return Object.entries(slot).map(([taskIndex,taskID],ti)=>{
              return [
                ...(ti||si)?[{id:atok(slotTime,taskID),type:'divider'}]:[],
                {id:taskID,type:'task',data:{taskID}}
              ]
            }).flat()
          }).flat()
        ]
      }).flat()
    }
  }
});













