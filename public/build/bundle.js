
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const generateRandomId = () => {
        return (
            (Math.random()*1000).toString(16).substr(0,5).replace('.','') 
            + '-' + 
            (Math.random()*1000).toString(16).substr(0,5).replace('.','') 
        );
    };

    const generatePlayerId = () => {
        return 'P-'+generateRandomId();
    };

    const generateGameId = () => {
        return 'G-'+generateRandomId();
    };

    /* src\utility\Button.svelte generated by Svelte v3.42.4 */

    const file$8 = "src\\utility\\Button.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let button;
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*type*/ ctx[2]) + " svelte-whrbob"));
    			button.disabled = /*disabled*/ ctx[3];
    			add_location(button, file$8, 8, 4, 135);
    			add_location(main, file$8, 7, 0, 123);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[1])) /*onClick*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);

    			if (dirty & /*type*/ 4 && button_class_value !== (button_class_value = "" + (null_to_empty(/*type*/ ctx[2]) + " svelte-whrbob"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	let { text = '' } = $$props;
    	let { onClick } = $$props;
    	let { type } = $$props;
    	let { disabled } = $$props;
    	const writable_props = ['text', 'onClick', 'type', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('onClick' in $$props) $$invalidate(1, onClick = $$props.onClick);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ text, onClick, type, disabled });

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('onClick' in $$props) $$invalidate(1, onClick = $$props.onClick);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, onClick, type, disabled];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			text: 0,
    			onClick: 1,
    			type: 2,
    			disabled: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClick*/ ctx[1] === undefined && !('onClick' in props)) {
    			console.warn("<Button> was created without expected prop 'onClick'");
    		}

    		if (/*type*/ ctx[2] === undefined && !('type' in props)) {
    			console.warn("<Button> was created without expected prop 'type'");
    		}

    		if (/*disabled*/ ctx[3] === undefined && !('disabled' in props)) {
    			console.warn("<Button> was created without expected prop 'disabled'");
    		}
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\utility\Popup.svelte generated by Svelte v3.42.4 */
    const file$7 = "src\\utility\\Popup.svelte";

    // (57:12) {#if showSave}
    function create_if_block_1$2(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				disabled: /*saveDisabled*/ ctx[3],
    				onClick: /*onSave*/ ctx[1],
    				text: /*saveLabel*/ ctx[4],
    				type: "primary"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*saveDisabled*/ 8) button_changes.disabled = /*saveDisabled*/ ctx[3];
    			if (dirty & /*onSave*/ 2) button_changes.onClick = /*onSave*/ ctx[1];
    			if (dirty & /*saveLabel*/ 16) button_changes.text = /*saveLabel*/ ctx[4];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(57:12) {#if showSave}",
    		ctx
    	});

    	return block;
    }

    // (60:12) {#if showCancel}
    function create_if_block$2(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				onClick: /*onCancel*/ ctx[2],
    				text: /*cancelLabel*/ ctx[5],
    				type: "secondary"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*onCancel*/ 4) button_changes.onClick = /*onCancel*/ ctx[2];
    			if (dirty & /*cancelLabel*/ 32) button_changes.text = /*cancelLabel*/ ctx[5];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(60:12) {#if showCancel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main2;
    	let dialog;
    	let h2;
    	let t0;
    	let t1;
    	let main0;
    	let t2;
    	let main1;
    	let t3;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	let if_block0 = /*showSave*/ ctx[6] && create_if_block_1$2(ctx);
    	let if_block1 = /*showCancel*/ ctx[7] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main2 = element("main");
    			dialog = element("dialog");
    			h2 = element("h2");
    			t0 = text(/*header*/ ctx[0]);
    			t1 = space();
    			main0 = element("main");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			main1 = element("main");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			add_location(h2, file$7, 51, 8, 1128);
    			attr_dev(main0, "class", "body svelte-14ovpv6");
    			add_location(main0, file$7, 52, 8, 1155);
    			attr_dev(main1, "class", "row");
    			add_location(main1, file$7, 55, 8, 1223);
    			attr_dev(dialog, "class", "svelte-14ovpv6");
    			add_location(dialog, file$7, 50, 4, 1110);
    			attr_dev(main2, "class", "popup svelte-14ovpv6");
    			add_location(main2, file$7, 49, 0, 1084);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main2, anchor);
    			append_dev(main2, dialog);
    			append_dev(dialog, h2);
    			append_dev(h2, t0);
    			append_dev(dialog, t1);
    			append_dev(dialog, main0);

    			if (default_slot) {
    				default_slot.m(main0, null);
    			}

    			append_dev(dialog, t2);
    			append_dev(dialog, main1);
    			if (if_block0) if_block0.m(main1, null);
    			append_dev(main1, t3);
    			if (if_block1) if_block1.m(main1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*header*/ 1) set_data_dev(t0, /*header*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*showSave*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showSave*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main1, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*showCancel*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showCancel*/ 128) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main2);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popup', slots, ['default']);
    	let { header } = $$props;
    	let { onSave } = $$props;
    	let { onCancel } = $$props;
    	let { saveDisabled } = $$props;
    	let { saveLabel = 'Save' } = $$props;
    	let { cancelLabel = 'Cancel' } = $$props;
    	let { showSave } = $$props;
    	let { showCancel } = $$props;

    	onMount(() => {
    		document.querySelector('dialog').showModal();
    	});

    	const writable_props = [
    		'header',
    		'onSave',
    		'onCancel',
    		'saveDisabled',
    		'saveLabel',
    		'cancelLabel',
    		'showSave',
    		'showCancel'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('onSave' in $$props) $$invalidate(1, onSave = $$props.onSave);
    		if ('onCancel' in $$props) $$invalidate(2, onCancel = $$props.onCancel);
    		if ('saveDisabled' in $$props) $$invalidate(3, saveDisabled = $$props.saveDisabled);
    		if ('saveLabel' in $$props) $$invalidate(4, saveLabel = $$props.saveLabel);
    		if ('cancelLabel' in $$props) $$invalidate(5, cancelLabel = $$props.cancelLabel);
    		if ('showSave' in $$props) $$invalidate(6, showSave = $$props.showSave);
    		if ('showCancel' in $$props) $$invalidate(7, showCancel = $$props.showCancel);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Button,
    		header,
    		onSave,
    		onCancel,
    		saveDisabled,
    		saveLabel,
    		cancelLabel,
    		showSave,
    		showCancel
    	});

    	$$self.$inject_state = $$props => {
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('onSave' in $$props) $$invalidate(1, onSave = $$props.onSave);
    		if ('onCancel' in $$props) $$invalidate(2, onCancel = $$props.onCancel);
    		if ('saveDisabled' in $$props) $$invalidate(3, saveDisabled = $$props.saveDisabled);
    		if ('saveLabel' in $$props) $$invalidate(4, saveLabel = $$props.saveLabel);
    		if ('cancelLabel' in $$props) $$invalidate(5, cancelLabel = $$props.cancelLabel);
    		if ('showSave' in $$props) $$invalidate(6, showSave = $$props.showSave);
    		if ('showCancel' in $$props) $$invalidate(7, showCancel = $$props.showCancel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		header,
    		onSave,
    		onCancel,
    		saveDisabled,
    		saveLabel,
    		cancelLabel,
    		showSave,
    		showCancel,
    		$$scope,
    		slots
    	];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			header: 0,
    			onSave: 1,
    			onCancel: 2,
    			saveDisabled: 3,
    			saveLabel: 4,
    			cancelLabel: 5,
    			showSave: 6,
    			showCancel: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*header*/ ctx[0] === undefined && !('header' in props)) {
    			console.warn("<Popup> was created without expected prop 'header'");
    		}

    		if (/*onSave*/ ctx[1] === undefined && !('onSave' in props)) {
    			console.warn("<Popup> was created without expected prop 'onSave'");
    		}

    		if (/*onCancel*/ ctx[2] === undefined && !('onCancel' in props)) {
    			console.warn("<Popup> was created without expected prop 'onCancel'");
    		}

    		if (/*saveDisabled*/ ctx[3] === undefined && !('saveDisabled' in props)) {
    			console.warn("<Popup> was created without expected prop 'saveDisabled'");
    		}

    		if (/*showSave*/ ctx[6] === undefined && !('showSave' in props)) {
    			console.warn("<Popup> was created without expected prop 'showSave'");
    		}

    		if (/*showCancel*/ ctx[7] === undefined && !('showCancel' in props)) {
    			console.warn("<Popup> was created without expected prop 'showCancel'");
    		}
    	}

    	get header() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSave() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSave(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCancel() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCancel(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get saveDisabled() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set saveDisabled(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get saveLabel() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set saveLabel(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cancelLabel() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cancelLabel(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showSave() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showSave(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showCancel() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showCancel(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\utility\Icon.svelte generated by Svelte v3.42.4 */

    const file$6 = "src\\utility\\Icon.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(button, "class", "icon svelte-rta9in");
    			add_location(button, file$6, 22, 4, 312);
    			add_location(main, file$6, 21, 0, 300);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*OnClick*/ ctx[1])) /*OnClick*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { text } = $$props;
    	let { OnClick } = $$props;
    	const writable_props = ['text', 'OnClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('OnClick' in $$props) $$invalidate(1, OnClick = $$props.OnClick);
    	};

    	$$self.$capture_state = () => ({ text, OnClick });

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('OnClick' in $$props) $$invalidate(1, OnClick = $$props.OnClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, OnClick];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { text: 0, OnClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !('text' in props)) {
    			console.warn("<Icon> was created without expected prop 'text'");
    		}

    		if (/*OnClick*/ ctx[1] === undefined && !('OnClick' in props)) {
    			console.warn("<Icon> was created without expected prop 'OnClick'");
    		}
    	}

    	get text() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get OnClick() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set OnClick(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\utility\Badge.svelte generated by Svelte v3.42.4 */

    const file$5 = "src\\utility\\Badge.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let span;
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			span = element("span");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(span, "class", span_class_value = "" + (/*style*/ ctx[0] + " " + (/*animation*/ ctx[2] ? 'animation' : '') + " svelte-vcjiaz"));
    			add_location(span, file$5, 37, 4, 775);
    			add_location(main, file$5, 36, 0, 763);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);

    			if (dirty & /*style, animation*/ 5 && span_class_value !== (span_class_value = "" + (/*style*/ ctx[0] + " " + (/*animation*/ ctx[2] ? 'animation' : '') + " svelte-vcjiaz"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Badge', slots, []);
    	let { style } = $$props;
    	let { text } = $$props;
    	let { animation } = $$props;
    	const writable_props = ['style', 'text', 'animation'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Badge> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('animation' in $$props) $$invalidate(2, animation = $$props.animation);
    	};

    	$$self.$capture_state = () => ({ style, text, animation });

    	$$self.$inject_state = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('animation' in $$props) $$invalidate(2, animation = $$props.animation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style, text, animation];
    }

    class Badge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { style: 0, text: 1, animation: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Badge",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*style*/ ctx[0] === undefined && !('style' in props)) {
    			console.warn("<Badge> was created without expected prop 'style'");
    		}

    		if (/*text*/ ctx[1] === undefined && !('text' in props)) {
    			console.warn("<Badge> was created without expected prop 'text'");
    		}

    		if (/*animation*/ ctx[2] === undefined && !('animation' in props)) {
    			console.warn("<Badge> was created without expected prop 'animation'");
    		}
    	}

    	get style() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animation() {
    		throw new Error("<Badge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animation(value) {
    		throw new Error("<Badge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\StartScreen.svelte generated by Svelte v3.42.4 */
    const file$4 = "src\\StartScreen.svelte";

    function create_fragment$4(ctx) {
    	let main1;
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let main0;
    	let button0;
    	let t1;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				onClick: /*onClear*/ ctx[1],
    				text: "Clear Data",
    				type: "secondary"
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				onClick: /*onNewGame*/ ctx[0],
    				text: "New Game",
    				type: "primary"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main1 = element("main");
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			main0 = element("main");
    			create_component(button0.$$.fragment);
    			t1 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(img, "class", "card spade svelte-1qmxm66");
    			if (!src_url_equal(img.src, img_src_value = "resource/home.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "home");
    			add_location(img, file$4, 10, 8, 180);
    			attr_dev(div, "class", "illustration svelte-1qmxm66");
    			add_location(div, file$4, 9, 4, 144);
    			attr_dev(main0, "class", "row");
    			add_location(main0, file$4, 13, 4, 264);
    			add_location(main1, file$4, 6, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main1, anchor);
    			append_dev(main1, div);
    			append_dev(div, img);
    			append_dev(main1, t0);
    			append_dev(main1, main0);
    			mount_component(button0, main0, null);
    			append_dev(main0, t1);
    			mount_component(button1, main0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};
    			if (dirty & /*onClear*/ 2) button0_changes.onClick = /*onClear*/ ctx[1];
    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*onNewGame*/ 1) button1_changes.onClick = /*onNewGame*/ ctx[0];
    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main1);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StartScreen', slots, []);
    	let { onNewGame } = $$props;
    	let { onClear } = $$props;
    	const writable_props = ['onNewGame', 'onClear'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StartScreen> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('onNewGame' in $$props) $$invalidate(0, onNewGame = $$props.onNewGame);
    		if ('onClear' in $$props) $$invalidate(1, onClear = $$props.onClear);
    	};

    	$$self.$capture_state = () => ({ Button, onNewGame, onClear });

    	$$self.$inject_state = $$props => {
    		if ('onNewGame' in $$props) $$invalidate(0, onNewGame = $$props.onNewGame);
    		if ('onClear' in $$props) $$invalidate(1, onClear = $$props.onClear);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onNewGame, onClear];
    }

    class StartScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { onNewGame: 0, onClear: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StartScreen",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onNewGame*/ ctx[0] === undefined && !('onNewGame' in props)) {
    			console.warn("<StartScreen> was created without expected prop 'onNewGame'");
    		}

    		if (/*onClear*/ ctx[1] === undefined && !('onClear' in props)) {
    			console.warn("<StartScreen> was created without expected prop 'onClear'");
    		}
    	}

    	get onNewGame() {
    		throw new Error("<StartScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNewGame(value) {
    		throw new Error("<StartScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClear() {
    		throw new Error("<StartScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClear(value) {
    		throw new Error("<StartScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\AddPlayerScreen.svelte generated by Svelte v3.42.4 */
    const file$3 = "src\\AddPlayerScreen.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (17:8) {#each players as player , index}
    function create_each_block$3(ctx) {
    	let li;
    	let div0;
    	let span0;
    	let t0_value = /*index*/ ctx[8] + 1 + "";
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*player*/ ctx[6].name + "";
    	let t3;
    	let t4;
    	let div1;
    	let icon;
    	let t5;
    	let current;

    	function func() {
    		return /*func*/ ctx[5](/*player*/ ctx[6]);
    	}

    	icon = new Icon({
    			props: { text: "X", OnClick: func },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			create_component(icon.$$.fragment);
    			t5 = space();
    			attr_dev(span0, "class", "index");
    			add_location(span0, file$3, 19, 20, 447);
    			add_location(span1, file$3, 20, 20, 509);
    			add_location(div0, file$3, 18, 16, 420);
    			attr_dev(div1, "class", "actions");
    			add_location(div1, file$3, 22, 16, 578);
    			add_location(li, file$3, 17, 12, 398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(li, t4);
    			append_dev(li, div1);
    			mount_component(icon, div1, null);
    			append_dev(li, t5);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*players*/ 4) && t3_value !== (t3_value = /*player*/ ctx[6].name + "")) set_data_dev(t3, t3_value);
    			const icon_changes = {};
    			if (dirty & /*deleteNewPlayer, players*/ 12) icon_changes.OnClick = func;
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(17:8) {#each players as player , index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main3;
    	let main0;
    	let h2;
    	let t1;
    	let ul;
    	let t2;
    	let main1;
    	let button0;
    	let t3;
    	let button1;
    	let t4;
    	let main2;
    	let button2;
    	let current;
    	let each_value = /*players*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	button0 = new Button({
    			props: {
    				text: "Existing",
    				type: "secondary",
    				onClick: /*getExistingPlayers*/ ctx[0]
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				text: "New",
    				type: "primary",
    				onClick: /*addNewPLayer*/ ctx[1]
    			},
    			$$inline: true
    		});

    	button2 = new Button({
    			props: {
    				disabled: /*players*/ ctx[2].length < 3,
    				text: "Next",
    				type: "primary",
    				onClick: /*goToGameScreen*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main3 = element("main");
    			main0 = element("main");
    			h2 = element("h2");
    			h2.textContent = "Add Players";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			main1 = element("main");
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			t4 = space();
    			main2 = element("main");
    			create_component(button2.$$.fragment);
    			add_location(h2, file$3, 13, 8, 296);
    			attr_dev(main0, "class", "row");
    			add_location(main0, file$3, 12, 4, 268);
    			add_location(ul, file$3, 15, 4, 337);
    			attr_dev(main1, "class", "row");
    			add_location(main1, file$3, 28, 4, 758);
    			attr_dev(main2, "class", "footer");
    			add_location(main2, file$3, 32, 4, 948);
    			add_location(main3, file$3, 11, 0, 256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main3, anchor);
    			append_dev(main3, main0);
    			append_dev(main0, h2);
    			append_dev(main3, t1);
    			append_dev(main3, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(main3, t2);
    			append_dev(main3, main1);
    			mount_component(button0, main1, null);
    			append_dev(main1, t3);
    			mount_component(button1, main1, null);
    			append_dev(main3, t4);
    			append_dev(main3, main2);
    			mount_component(button2, main2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*deleteNewPlayer, players*/ 12) {
    				each_value = /*players*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const button0_changes = {};
    			if (dirty & /*getExistingPlayers*/ 1) button0_changes.onClick = /*getExistingPlayers*/ ctx[0];
    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*addNewPLayer*/ 2) button1_changes.onClick = /*addNewPLayer*/ ctx[1];
    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*players*/ 4) button2_changes.disabled = /*players*/ ctx[2].length < 3;
    			if (dirty & /*goToGameScreen*/ 16) button2_changes.onClick = /*goToGameScreen*/ ctx[4];
    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main3);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddPlayerScreen', slots, []);
    	let { getExistingPlayers } = $$props;
    	let { addNewPLayer } = $$props;
    	let { players = [] } = $$props;
    	let { deleteNewPlayer } = $$props;
    	let { goToGameScreen } = $$props;

    	const writable_props = [
    		'getExistingPlayers',
    		'addNewPLayer',
    		'players',
    		'deleteNewPlayer',
    		'goToGameScreen'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddPlayerScreen> was created with unknown prop '${key}'`);
    	});

    	const func = player => deleteNewPlayer(player.id);

    	$$self.$$set = $$props => {
    		if ('getExistingPlayers' in $$props) $$invalidate(0, getExistingPlayers = $$props.getExistingPlayers);
    		if ('addNewPLayer' in $$props) $$invalidate(1, addNewPLayer = $$props.addNewPLayer);
    		if ('players' in $$props) $$invalidate(2, players = $$props.players);
    		if ('deleteNewPlayer' in $$props) $$invalidate(3, deleteNewPlayer = $$props.deleteNewPlayer);
    		if ('goToGameScreen' in $$props) $$invalidate(4, goToGameScreen = $$props.goToGameScreen);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		Icon,
    		getExistingPlayers,
    		addNewPLayer,
    		players,
    		deleteNewPlayer,
    		goToGameScreen
    	});

    	$$self.$inject_state = $$props => {
    		if ('getExistingPlayers' in $$props) $$invalidate(0, getExistingPlayers = $$props.getExistingPlayers);
    		if ('addNewPLayer' in $$props) $$invalidate(1, addNewPLayer = $$props.addNewPLayer);
    		if ('players' in $$props) $$invalidate(2, players = $$props.players);
    		if ('deleteNewPlayer' in $$props) $$invalidate(3, deleteNewPlayer = $$props.deleteNewPlayer);
    		if ('goToGameScreen' in $$props) $$invalidate(4, goToGameScreen = $$props.goToGameScreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		getExistingPlayers,
    		addNewPLayer,
    		players,
    		deleteNewPlayer,
    		goToGameScreen,
    		func
    	];
    }

    class AddPlayerScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			getExistingPlayers: 0,
    			addNewPLayer: 1,
    			players: 2,
    			deleteNewPlayer: 3,
    			goToGameScreen: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddPlayerScreen",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*getExistingPlayers*/ ctx[0] === undefined && !('getExistingPlayers' in props)) {
    			console.warn("<AddPlayerScreen> was created without expected prop 'getExistingPlayers'");
    		}

    		if (/*addNewPLayer*/ ctx[1] === undefined && !('addNewPLayer' in props)) {
    			console.warn("<AddPlayerScreen> was created without expected prop 'addNewPLayer'");
    		}

    		if (/*deleteNewPlayer*/ ctx[3] === undefined && !('deleteNewPlayer' in props)) {
    			console.warn("<AddPlayerScreen> was created without expected prop 'deleteNewPlayer'");
    		}

    		if (/*goToGameScreen*/ ctx[4] === undefined && !('goToGameScreen' in props)) {
    			console.warn("<AddPlayerScreen> was created without expected prop 'goToGameScreen'");
    		}
    	}

    	get getExistingPlayers() {
    		throw new Error("<AddPlayerScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getExistingPlayers(value) {
    		throw new Error("<AddPlayerScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addNewPLayer() {
    		throw new Error("<AddPlayerScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addNewPLayer(value) {
    		throw new Error("<AddPlayerScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get players() {
    		throw new Error("<AddPlayerScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<AddPlayerScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deleteNewPlayer() {
    		throw new Error("<AddPlayerScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deleteNewPlayer(value) {
    		throw new Error("<AddPlayerScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goToGameScreen() {
    		throw new Error("<AddPlayerScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goToGameScreen(value) {
    		throw new Error("<AddPlayerScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\GameStatsScreen.svelte generated by Svelte v3.42.4 */
    const file$2 = "src\\GameStatsScreen.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (20:8) {#if rounds.length}
    function create_if_block_1$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: "Show Rounds",
    				type: "secondary",
    				onClick: /*goToRoundDetailScreen*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*goToRoundDetailScreen*/ 32) button_changes.onClick = /*goToRoundDetailScreen*/ ctx[5];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(20:8) {#if rounds.length}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#each players as player , index}
    function create_each_block$2(ctx) {
    	let li;
    	let div0;
    	let span0;
    	let t0_value = /*index*/ ctx[8] + 1 + "";
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*player*/ ctx[6].name + "";
    	let t3;
    	let t4;
    	let div1;
    	let icon;
    	let t5;
    	let current;

    	icon = new Icon({
    			props: { text: /*player*/ ctx[6].score },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			create_component(icon.$$.fragment);
    			t5 = space();
    			attr_dev(span0, "class", "index");
    			add_location(span0, file$2, 28, 20, 663);
    			add_location(span1, file$2, 29, 20, 725);
    			add_location(div0, file$2, 27, 16, 636);
    			attr_dev(div1, "class", "score");
    			add_location(div1, file$2, 31, 16, 794);
    			add_location(li, file$2, 26, 12, 614);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(li, t4);
    			append_dev(li, div1);
    			mount_component(icon, div1, null);
    			append_dev(li, t5);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*players*/ 1) && t3_value !== (t3_value = /*player*/ ctx[6].name + "")) set_data_dev(t3, t3_value);
    			const icon_changes = {};
    			if (dirty & /*players*/ 1) icon_changes.text = /*player*/ ctx[6].score;
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(26:8) {#each players as player , index}",
    		ctx
    	});

    	return block;
    }

    // (42:12) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: "Complete",
    				type: "primary",
    				onClick: /*completeGame*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*completeGame*/ 16) button_changes.onClick = /*completeGame*/ ctx[4];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(42:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:8) {#if !rounds.length}
    function create_if_block$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: "Previous",
    				type: "secondary",
    				onClick: /*goToAddPlayerScreen*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*goToAddPlayerScreen*/ 2) button_changes.onClick = /*goToAddPlayerScreen*/ ctx[1];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:8) {#if !rounds.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main3;
    	let main0;
    	let h2;
    	let t1;
    	let main1;
    	let t2;
    	let br;
    	let t3;
    	let ul;
    	let t4;
    	let main2;
    	let current_block_type_index;
    	let if_block1;
    	let t5;
    	let button;
    	let current;
    	let if_block0 = /*rounds*/ ctx[2].length && create_if_block_1$1(ctx);
    	let each_value = /*players*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*rounds*/ ctx[2].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	button = new Button({
    			props: {
    				text: "Add Round",
    				type: "primary",
    				onClick: /*addNewRound*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main3 = element("main");
    			main0 = element("main");
    			h2 = element("h2");
    			h2.textContent = "Game Stats";
    			t1 = space();
    			main1 = element("main");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			main2 = element("main");
    			if_block1.c();
    			t5 = space();
    			create_component(button.$$.fragment);
    			add_location(h2, file$2, 15, 8, 327);
    			attr_dev(main0, "class", "row");
    			add_location(main0, file$2, 14, 4, 299);
    			attr_dev(main1, "class", "row");
    			add_location(main1, file$2, 18, 4, 369);
    			add_location(br, file$2, 23, 4, 542);
    			add_location(ul, file$2, 24, 4, 553);
    			attr_dev(main2, "class", "footer");
    			add_location(main2, file$2, 38, 4, 946);
    			add_location(main3, file$2, 13, 0, 287);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main3, anchor);
    			append_dev(main3, main0);
    			append_dev(main0, h2);
    			append_dev(main3, t1);
    			append_dev(main3, main1);
    			if (if_block0) if_block0.m(main1, null);
    			append_dev(main3, t2);
    			append_dev(main3, br);
    			append_dev(main3, t3);
    			append_dev(main3, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(main3, t4);
    			append_dev(main3, main2);
    			if_blocks[current_block_type_index].m(main2, null);
    			append_dev(main2, t5);
    			mount_component(button, main2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*rounds*/ ctx[2].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*rounds*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main1, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*players*/ 1) {
    				each_value = /*players*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(main2, t5);
    			}

    			const button_changes = {};
    			if (dirty & /*addNewRound*/ 8) button_changes.onClick = /*addNewRound*/ ctx[3];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block1);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block1);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main3);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if_blocks[current_block_type_index].d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GameStatsScreen', slots, []);
    	let { players = [] } = $$props;
    	let { goToAddPlayerScreen } = $$props;
    	let { rounds = [] } = $$props;
    	let { addNewRound } = $$props;
    	let { completeGame } = $$props;
    	let { goToRoundDetailScreen } = $$props;

    	const writable_props = [
    		'players',
    		'goToAddPlayerScreen',
    		'rounds',
    		'addNewRound',
    		'completeGame',
    		'goToRoundDetailScreen'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GameStatsScreen> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    		if ('goToAddPlayerScreen' in $$props) $$invalidate(1, goToAddPlayerScreen = $$props.goToAddPlayerScreen);
    		if ('rounds' in $$props) $$invalidate(2, rounds = $$props.rounds);
    		if ('addNewRound' in $$props) $$invalidate(3, addNewRound = $$props.addNewRound);
    		if ('completeGame' in $$props) $$invalidate(4, completeGame = $$props.completeGame);
    		if ('goToRoundDetailScreen' in $$props) $$invalidate(5, goToRoundDetailScreen = $$props.goToRoundDetailScreen);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		Icon,
    		players,
    		goToAddPlayerScreen,
    		rounds,
    		addNewRound,
    		completeGame,
    		goToRoundDetailScreen
    	});

    	$$self.$inject_state = $$props => {
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    		if ('goToAddPlayerScreen' in $$props) $$invalidate(1, goToAddPlayerScreen = $$props.goToAddPlayerScreen);
    		if ('rounds' in $$props) $$invalidate(2, rounds = $$props.rounds);
    		if ('addNewRound' in $$props) $$invalidate(3, addNewRound = $$props.addNewRound);
    		if ('completeGame' in $$props) $$invalidate(4, completeGame = $$props.completeGame);
    		if ('goToRoundDetailScreen' in $$props) $$invalidate(5, goToRoundDetailScreen = $$props.goToRoundDetailScreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		players,
    		goToAddPlayerScreen,
    		rounds,
    		addNewRound,
    		completeGame,
    		goToRoundDetailScreen
    	];
    }

    class GameStatsScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			players: 0,
    			goToAddPlayerScreen: 1,
    			rounds: 2,
    			addNewRound: 3,
    			completeGame: 4,
    			goToRoundDetailScreen: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameStatsScreen",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*goToAddPlayerScreen*/ ctx[1] === undefined && !('goToAddPlayerScreen' in props)) {
    			console.warn("<GameStatsScreen> was created without expected prop 'goToAddPlayerScreen'");
    		}

    		if (/*addNewRound*/ ctx[3] === undefined && !('addNewRound' in props)) {
    			console.warn("<GameStatsScreen> was created without expected prop 'addNewRound'");
    		}

    		if (/*completeGame*/ ctx[4] === undefined && !('completeGame' in props)) {
    			console.warn("<GameStatsScreen> was created without expected prop 'completeGame'");
    		}

    		if (/*goToRoundDetailScreen*/ ctx[5] === undefined && !('goToRoundDetailScreen' in props)) {
    			console.warn("<GameStatsScreen> was created without expected prop 'goToRoundDetailScreen'");
    		}
    	}

    	get players() {
    		throw new Error("<GameStatsScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<GameStatsScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goToAddPlayerScreen() {
    		throw new Error("<GameStatsScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goToAddPlayerScreen(value) {
    		throw new Error("<GameStatsScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounds() {
    		throw new Error("<GameStatsScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounds(value) {
    		throw new Error("<GameStatsScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addNewRound() {
    		throw new Error("<GameStatsScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addNewRound(value) {
    		throw new Error("<GameStatsScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get completeGame() {
    		throw new Error("<GameStatsScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set completeGame(value) {
    		throw new Error("<GameStatsScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goToRoundDetailScreen() {
    		throw new Error("<GameStatsScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goToRoundDetailScreen(value) {
    		throw new Error("<GameStatsScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\RoundsDetailScreen.svelte generated by Svelte v3.42.4 */
    const file$1 = "src\\RoundsDetailScreen.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (17:12) {#each rounds as round , index}
    function create_each_block$1(ctx) {
    	let button;
    	let t;
    	let br;
    	let current;

    	function func() {
    		return /*func*/ ctx[3](/*round*/ ctx[4]);
    	}

    	button = new Button({
    			props: {
    				text: "Round " + (/*index*/ ctx[6] + 1),
    				type: "primary",
    				onClick: func
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    			t = space();
    			br = element("br");
    			add_location(br, file$1, 18, 16, 450);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty & /*openRoundDetail, rounds*/ 6) button_changes.onClick = func;
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(17:12) {#each rounds as round , index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main3;
    	let main0;
    	let h2;
    	let t1;
    	let main1;
    	let ul;
    	let t2;
    	let main2;
    	let button;
    	let current;
    	let each_value = /*rounds*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	button = new Button({
    			props: {
    				text: "Previous",
    				type: "secondary",
    				onClick: /*goToGameScreen*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main3 = element("main");
    			main0 = element("main");
    			h2 = element("h2");
    			h2.textContent = "Round Details";
    			t1 = space();
    			main1 = element("main");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			main2 = element("main");
    			create_component(button.$$.fragment);
    			add_location(h2, file$1, 11, 8, 196);
    			attr_dev(main0, "class", "row");
    			add_location(main0, file$1, 10, 4, 168);
    			add_location(ul, file$1, 15, 8, 269);
    			attr_dev(main1, "class", "row");
    			add_location(main1, file$1, 14, 4, 241);
    			attr_dev(main2, "class", "footer");
    			add_location(main2, file$1, 23, 4, 516);
    			add_location(main3, file$1, 9, 0, 156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main3, anchor);
    			append_dev(main3, main0);
    			append_dev(main0, h2);
    			append_dev(main3, t1);
    			append_dev(main3, main1);
    			append_dev(main1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(main3, t2);
    			append_dev(main3, main2);
    			mount_component(button, main2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*openRoundDetail, rounds*/ 6) {
    				each_value = /*rounds*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const button_changes = {};
    			if (dirty & /*goToGameScreen*/ 1) button_changes.onClick = /*goToGameScreen*/ ctx[0];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main3);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoundsDetailScreen', slots, []);
    	let { goToGameScreen } = $$props;
    	let { rounds = [] } = $$props;
    	let { openRoundDetail } = $$props;
    	const writable_props = ['goToGameScreen', 'rounds', 'openRoundDetail'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RoundsDetailScreen> was created with unknown prop '${key}'`);
    	});

    	const func = round => openRoundDetail(round);

    	$$self.$$set = $$props => {
    		if ('goToGameScreen' in $$props) $$invalidate(0, goToGameScreen = $$props.goToGameScreen);
    		if ('rounds' in $$props) $$invalidate(1, rounds = $$props.rounds);
    		if ('openRoundDetail' in $$props) $$invalidate(2, openRoundDetail = $$props.openRoundDetail);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		goToGameScreen,
    		rounds,
    		openRoundDetail
    	});

    	$$self.$inject_state = $$props => {
    		if ('goToGameScreen' in $$props) $$invalidate(0, goToGameScreen = $$props.goToGameScreen);
    		if ('rounds' in $$props) $$invalidate(1, rounds = $$props.rounds);
    		if ('openRoundDetail' in $$props) $$invalidate(2, openRoundDetail = $$props.openRoundDetail);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [goToGameScreen, rounds, openRoundDetail, func];
    }

    class RoundsDetailScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			goToGameScreen: 0,
    			rounds: 1,
    			openRoundDetail: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoundsDetailScreen",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*goToGameScreen*/ ctx[0] === undefined && !('goToGameScreen' in props)) {
    			console.warn("<RoundsDetailScreen> was created without expected prop 'goToGameScreen'");
    		}

    		if (/*openRoundDetail*/ ctx[2] === undefined && !('openRoundDetail' in props)) {
    			console.warn("<RoundsDetailScreen> was created without expected prop 'openRoundDetail'");
    		}
    	}

    	get goToGameScreen() {
    		throw new Error("<RoundsDetailScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goToGameScreen(value) {
    		throw new Error("<RoundsDetailScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounds() {
    		throw new Error("<RoundsDetailScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounds(value) {
    		throw new Error("<RoundsDetailScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openRoundDetail() {
    		throw new Error("<RoundsDetailScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openRoundDetail(value) {
    		throw new Error("<RoundsDetailScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.4 */

    const { Object: Object_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	child_ctx[39] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    // (292:1) {#if SCREEN.HOME_SCREEN }
    function create_if_block_10(ctx) {
    	let startscreen;
    	let current;

    	startscreen = new StartScreen({
    			props: {
    				onNewGame: /*startNewGame*/ ctx[7],
    				onClear: /*clearAppData*/ ctx[27]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(startscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(startscreen, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(startscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(startscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(startscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(292:1) {#if SCREEN.HOME_SCREEN }",
    		ctx
    	});

    	return block;
    }

    // (296:1) {#if SCREEN.ADD_PLAYER_SCREEN }
    function create_if_block_9(ctx) {
    	let addplayerscreen;
    	let current;

    	addplayerscreen = new AddPlayerScreen({
    			props: {
    				players: /*currentGame*/ ctx[5].players,
    				addNewPLayer: /*addNewPLayer*/ ctx[8],
    				getExistingPlayers: /*getExistingPlayers*/ ctx[9],
    				deleteNewPlayer: /*deleteNewPlayer*/ ctx[10],
    				goToGameScreen: /*goToGameScreen*/ ctx[17]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(addplayerscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addplayerscreen, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const addplayerscreen_changes = {};
    			if (dirty[0] & /*currentGame*/ 32) addplayerscreen_changes.players = /*currentGame*/ ctx[5].players;
    			addplayerscreen.$set(addplayerscreen_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addplayerscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addplayerscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addplayerscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(296:1) {#if SCREEN.ADD_PLAYER_SCREEN }",
    		ctx
    	});

    	return block;
    }

    // (300:1) {#if SCREEN.GAME_STAT_SCREEN}
    function create_if_block_8(ctx) {
    	let gamestatsscreen;
    	let current;

    	gamestatsscreen = new GameStatsScreen({
    			props: {
    				rounds: /*currentGame*/ ctx[5].rounds,
    				players: /*currentGame*/ ctx[5].players,
    				goToAddPlayerScreen: /*goToAddPlayerScreen*/ ctx[18],
    				addNewRound: /*addNewRound*/ ctx[19],
    				completeGame: /*completeGame*/ ctx[23],
    				goToRoundDetailScreen: /*goToRoundDetailScreen*/ ctx[24]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gamestatsscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamestatsscreen, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gamestatsscreen_changes = {};
    			if (dirty[0] & /*currentGame*/ 32) gamestatsscreen_changes.rounds = /*currentGame*/ ctx[5].rounds;
    			if (dirty[0] & /*currentGame*/ 32) gamestatsscreen_changes.players = /*currentGame*/ ctx[5].players;
    			gamestatsscreen.$set(gamestatsscreen_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamestatsscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamestatsscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gamestatsscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(300:1) {#if SCREEN.GAME_STAT_SCREEN}",
    		ctx
    	});

    	return block;
    }

    // (304:1) {#if SCREEN.ROUND_DETAIL_SCREEN}
    function create_if_block_7(ctx) {
    	let roundsdetailscreen;
    	let current;

    	roundsdetailscreen = new RoundsDetailScreen({
    			props: {
    				rounds: /*currentGame*/ ctx[5].rounds,
    				players: /*currentGame*/ ctx[5].players,
    				goToGameScreen: /*goToGameScreen*/ ctx[17],
    				openRoundDetail: /*openRoundDetail*/ ctx[25]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(roundsdetailscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(roundsdetailscreen, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const roundsdetailscreen_changes = {};
    			if (dirty[0] & /*currentGame*/ 32) roundsdetailscreen_changes.rounds = /*currentGame*/ ctx[5].rounds;
    			if (dirty[0] & /*currentGame*/ 32) roundsdetailscreen_changes.players = /*currentGame*/ ctx[5].players;
    			roundsdetailscreen.$set(roundsdetailscreen_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(roundsdetailscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(roundsdetailscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(roundsdetailscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(304:1) {#if SCREEN.ROUND_DETAIL_SCREEN}",
    		ctx
    	});

    	return block;
    }

    // (308:1) {#if POPUP.NEW_PLAYER}
    function create_if_block_6(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				header: "Add New Player",
    				onSave: /*newPlayerSave*/ ctx[12],
    				onCancel: /*newPlayerCancel*/ ctx[13],
    				saveDisabled: !/*newPlayer*/ ctx[3].name,
    				showSave: true,
    				showCancel: true,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popup_changes = {};
    			if (dirty[0] & /*newPlayer*/ 8) popup_changes.saveDisabled = !/*newPlayer*/ ctx[3].name;

    			if (dirty[0] & /*newPlayer*/ 8 | dirty[1] & /*$$scope*/ 8192) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(308:1) {#if POPUP.NEW_PLAYER}",
    		ctx
    	});

    	return block;
    }

    // (309:2) <Popup header="Add New Player" onSave={newPlayerSave} onCancel={newPlayerCancel} saveDisabled={!newPlayer.name} showSave showCancel>
    function create_default_slot_3(ctx) {
    	let input0;
    	let t0;
    	let main;
    	let input1;
    	let t1;
    	let label;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			main = element("main");
    			input1 = element("input");
    			t1 = space();
    			label = element("label");
    			label.textContent = "Save for future use";
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "m-b-10");
    			attr_dev(input0, "placeholder", "Player Name");
    			add_location(input0, file, 310, 3, 7660);
    			attr_dev(input1, "id", "futuresave");
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "name", "futuresave");
    			add_location(input1, file, 312, 4, 7784);
    			attr_dev(label, "for", "futuresave");
    			add_location(label, file, 314, 4, 7993);
    			attr_dev(main, "class", "m-b-10 row");
    			add_location(main, file, 311, 3, 7754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*newPlayer*/ ctx[3].name);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, input1);
    			input1.checked = /*newPlayer*/ ctx[3].saveForFuture;
    			append_dev(main, t1);
    			append_dev(main, label);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[29]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[30])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*newPlayer*/ 8 && input0.value !== /*newPlayer*/ ctx[3].name) {
    				set_input_value(input0, /*newPlayer*/ ctx[3].name);
    			}

    			if (dirty[0] & /*newPlayer*/ 8) {
    				input1.checked = /*newPlayer*/ ctx[3].saveForFuture;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(309:2) <Popup header=\\\"Add New Player\\\" onSave={newPlayerSave} onCancel={newPlayerCancel} saveDisabled={!newPlayer.name} showSave showCancel>",
    		ctx
    	});

    	return block;
    }

    // (320:1) {#if POPUP.EXISTING_PLAYER}
    function create_if_block_3(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				header: "Select Existing Players",
    				onSave: /*existingPlayerSave*/ ctx[15],
    				onCancel: /*existingPlayerCancel*/ ctx[14],
    				saveDisabled: !/*existingPlayerSelected*/ ctx[4].length,
    				showSave: true,
    				showCancel: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popup_changes = {};
    			if (dirty[0] & /*existingPlayerSelected*/ 16) popup_changes.saveDisabled = !/*existingPlayerSelected*/ ctx[4].length;

    			if (dirty[0] & /*state, currentGame*/ 33 | dirty[1] & /*$$scope*/ 8192) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(320:1) {#if POPUP.EXISTING_PLAYER}",
    		ctx
    	});

    	return block;
    }

    // (339:4) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No Existing Players Found.";
    			add_location(p, file, 339, 5, 8852);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(339:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (323:4) {#if state.players.length}
    function create_if_block_4(ctx) {
    	let ul;
    	let current;
    	let each_value_2 = /*state*/ ctx[0].players;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "existing-player");
    			add_location(ul, file, 323, 5, 8313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*state, deleteExistingPlayer, selectExistingPlayer, currentGame*/ 67617) {
    				each_value_2 = /*state*/ ctx[0].players;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(323:4) {#if state.players.length}",
    		ctx
    	});

    	return block;
    }

    // (326:7) {#if currentGame.players.findIndex(plr => plr.id === player.id) === -1}
    function create_if_block_5(ctx) {
    	let li;
    	let label;
    	let input;
    	let input_name_value;
    	let input_id_value;
    	let t0;
    	let t1_value = /*player*/ ctx[37].name + "";
    	let t1;
    	let t2;
    	let div;
    	let icon;
    	let t3;
    	let li_id_value;
    	let current;
    	let mounted;
    	let dispose;

    	function func_1() {
    		return /*func_1*/ ctx[31](/*player*/ ctx[37]);
    	}

    	icon = new Icon({
    			props: { text: "X", OnClick: func_1 },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			div = element("div");
    			create_component(icon.$$.fragment);
    			t3 = space();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "m-r-5");
    			attr_dev(input, "name", input_name_value = /*player*/ ctx[37].id);
    			attr_dev(input, "id", input_id_value = /*player*/ ctx[37].id);
    			add_location(input, file, 328, 10, 8514);
    			add_location(label, file, 327, 9, 8496);
    			attr_dev(div, "class", "actions");
    			add_location(div, file, 331, 9, 8668);
    			attr_dev(li, "id", li_id_value = /*player*/ ctx[37].id);
    			add_location(li, file, 326, 8, 8467);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, label);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(li, t2);
    			append_dev(li, div);
    			mount_component(icon, div, null);
    			append_dev(li, t3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*selectExistingPlayer*/ ctx[16], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*state*/ 1 && input_name_value !== (input_name_value = /*player*/ ctx[37].id)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (!current || dirty[0] & /*state*/ 1 && input_id_value !== (input_id_value = /*player*/ ctx[37].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if ((!current || dirty[0] & /*state*/ 1) && t1_value !== (t1_value = /*player*/ ctx[37].name + "")) set_data_dev(t1, t1_value);
    			const icon_changes = {};
    			if (dirty[0] & /*state*/ 1) icon_changes.OnClick = func_1;
    			icon.$set(icon_changes);

    			if (!current || dirty[0] & /*state*/ 1 && li_id_value !== (li_id_value = /*player*/ ctx[37].id)) {
    				attr_dev(li, "id", li_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(326:7) {#if currentGame.players.findIndex(plr => plr.id === player.id) === -1}",
    		ctx
    	});

    	return block;
    }

    // (325:6) {#each state.players as player}
    function create_each_block_2(ctx) {
    	let show_if = /*currentGame*/ ctx[5].players.findIndex(func) === -1;
    	let if_block_anchor;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[28](/*player*/ ctx[37], ...args);
    	}

    	let if_block = show_if && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*currentGame, state*/ 33) show_if = /*currentGame*/ ctx[5].players.findIndex(func) === -1;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*currentGame, state*/ 33) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(325:6) {#each state.players as player}",
    		ctx
    	});

    	return block;
    }

    // (321:2) <Popup header="Select Existing Players" onSave={existingPlayerSave} onCancel={existingPlayerCancel} saveDisabled={!existingPlayerSelected.length} showSave showCancel>
    function create_default_slot_2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_4, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*state*/ ctx[0].players.length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(321:2) <Popup header=\\\"Select Existing Players\\\" onSave={existingPlayerSave} onCancel={existingPlayerCancel} saveDisabled={!existingPlayerSelected.length} showSave showCancel>",
    		ctx
    	});

    	return block;
    }

    // (346:1) {#if POPUP.ADD_ROUND}
    function create_if_block_2(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				header: "Add Score",
    				onSave: /*saveNewRound*/ ctx[20],
    				onCancel: /*cancelNewRound*/ ctx[21],
    				showSave: true,
    				showCancel: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popup_changes = {};

    			if (dirty[0] & /*currentGame*/ 32 | dirty[1] & /*$$scope*/ 8192) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(346:1) {#if POPUP.ADD_ROUND}",
    		ctx
    	});

    	return block;
    }

    // (349:4) {#each currentGame.players as player}
    function create_each_block_1(ctx) {
    	let li;
    	let label;
    	let t0_value = /*player*/ ctx[37].name + "";
    	let t0;
    	let label_for_value;
    	let t1;
    	let input;
    	let input_name_value;
    	let t2;
    	let li_id_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			attr_dev(label, "for", label_for_value = /*player*/ ctx[37].id);
    			add_location(label, file, 350, 6, 9157);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "name", input_name_value = /*player*/ ctx[37].id);
    			add_location(input, file, 351, 6, 9208);
    			attr_dev(li, "class", "round-player");
    			attr_dev(li, "id", li_id_value = /*player*/ ctx[37].id);
    			add_location(li, file, 349, 5, 9110);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, label);
    			append_dev(label, t0);
    			append_dev(li, t1);
    			append_dev(li, input);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*updatePlayerScore*/ ctx[22], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentGame*/ 32 && t0_value !== (t0_value = /*player*/ ctx[37].name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*currentGame*/ 32 && label_for_value !== (label_for_value = /*player*/ ctx[37].id)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*currentGame*/ 32 && input_name_value !== (input_name_value = /*player*/ ctx[37].id)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty[0] & /*currentGame*/ 32 && li_id_value !== (li_id_value = /*player*/ ctx[37].id)) {
    				attr_dev(li, "id", li_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(349:4) {#each currentGame.players as player}",
    		ctx
    	});

    	return block;
    }

    // (347:2) <Popup header="Add Score" onSave={saveNewRound} onCancel={cancelNewRound} showSave showCancel>
    function create_default_slot_1(ctx) {
    	let ul;
    	let each_value_1 = /*currentGame*/ ctx[5].players;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "add-round");
    			add_location(ul, file, 347, 3, 9040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentGame, updatePlayerScore*/ 4194336) {
    				each_value_1 = /*currentGame*/ ctx[5].players;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(347:2) <Popup header=\\\"Add Score\\\" onSave={saveNewRound} onCancel={cancelNewRound} showSave showCancel>",
    		ctx
    	});

    	return block;
    }

    // (359:1) {#if POPUP.ROUND_DETAIL_POPUP}
    function create_if_block(ctx) {
    	let popup;
    	let current;

    	popup = new Popup({
    			props: {
    				header: "Round Detail",
    				onCancel: /*closeRoundDetail*/ ctx[26],
    				showCancel: true,
    				cancelLabel: "Close",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popup_changes = {};

    			if (dirty[0] & /*currentGame, selectedRoundForDetail*/ 96 | dirty[1] & /*$$scope*/ 8192) {
    				popup_changes.$$scope = { dirty, ctx };
    			}

    			popup.$set(popup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(359:1) {#if POPUP.ROUND_DETAIL_POPUP}",
    		ctx
    	});

    	return block;
    }

    // (369:7) {#if selectedRoundForDetail[player.id] == 0}
    function create_if_block_1(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				text: "winner",
    				style: "success",
    				animation: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(369:7) {#if selectedRoundForDetail[player.id] == 0}",
    		ctx
    	});

    	return block;
    }

    // (362:4) {#each currentGame.players as player , index}
    function create_each_block(ctx) {
    	let li;
    	let div;
    	let span;
    	let t0_value = /*index*/ ctx[39] + 1 + "";
    	let t0;
    	let t1;
    	let t2;
    	let label;
    	let t3_value = /*player*/ ctx[37].name + "";
    	let t3;
    	let label_for_value;
    	let t4;
    	let main;
    	let t5;
    	let icon;
    	let t6;
    	let li_id_value;
    	let current;
    	let if_block = /*selectedRoundForDetail*/ ctx[6][/*player*/ ctx[37].id] == 0 && create_if_block_1(ctx);

    	icon = new Icon({
    			props: {
    				text: /*selectedRoundForDetail*/ ctx[6][/*player*/ ctx[37].id]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = space();
    			label = element("label");
    			t3 = text(t3_value);
    			t4 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			t5 = space();
    			create_component(icon.$$.fragment);
    			t6 = space();
    			attr_dev(span, "class", "index");
    			add_location(span, file, 364, 7, 9594);
    			attr_dev(label, "for", label_for_value = /*player*/ ctx[37].id);
    			add_location(label, file, 365, 7, 9642);
    			add_location(div, file, 363, 6, 9581);
    			attr_dev(main, "class", "row");
    			add_location(main, file, 367, 6, 9706);
    			attr_dev(li, "class", "round-player");
    			attr_dev(li, "id", li_id_value = /*player*/ ctx[37].id);
    			add_location(li, file, 362, 5, 9534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, label);
    			append_dev(label, t3);
    			append_dev(li, t4);
    			append_dev(li, main);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t5);
    			mount_component(icon, main, null);
    			append_dev(li, t6);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*currentGame*/ 32) && t3_value !== (t3_value = /*player*/ ctx[37].name + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty[0] & /*currentGame*/ 32 && label_for_value !== (label_for_value = /*player*/ ctx[37].id)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (/*selectedRoundForDetail*/ ctx[6][/*player*/ ctx[37].id] == 0) {
    				if (if_block) {
    					if (dirty[0] & /*selectedRoundForDetail, currentGame*/ 96) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, t5);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const icon_changes = {};
    			if (dirty[0] & /*selectedRoundForDetail, currentGame*/ 96) icon_changes.text = /*selectedRoundForDetail*/ ctx[6][/*player*/ ctx[37].id];
    			icon.$set(icon_changes);

    			if (!current || dirty[0] & /*currentGame*/ 32 && li_id_value !== (li_id_value = /*player*/ ctx[37].id)) {
    				attr_dev(li, "id", li_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block) if_block.d();
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(362:4) {#each currentGame.players as player , index}",
    		ctx
    	});

    	return block;
    }

    // (360:2) <Popup header="Round Detail" onCancel={closeRoundDetail} showCancel cancelLabel="Close">
    function create_default_slot(ctx) {
    	let ul;
    	let current;
    	let each_value = /*currentGame*/ ctx[5].players;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "add-round");
    			add_location(ul, file, 360, 3, 9456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentGame, selectedRoundForDetail*/ 96) {
    				each_value = /*currentGame*/ ctx[5].players;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(360:2) <Popup header=\\\"Round Detail\\\" onCancel={closeRoundDetail} showCancel cancelLabel=\\\"Close\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let current;
    	let if_block0 = /*SCREEN*/ ctx[2].HOME_SCREEN && create_if_block_10(ctx);
    	let if_block1 = /*SCREEN*/ ctx[2].ADD_PLAYER_SCREEN && create_if_block_9(ctx);
    	let if_block2 = /*SCREEN*/ ctx[2].GAME_STAT_SCREEN && create_if_block_8(ctx);
    	let if_block3 = /*SCREEN*/ ctx[2].ROUND_DETAIL_SCREEN && create_if_block_7(ctx);
    	let if_block4 = /*POPUP*/ ctx[1].NEW_PLAYER && create_if_block_6(ctx);
    	let if_block5 = /*POPUP*/ ctx[1].EXISTING_PLAYER && create_if_block_3(ctx);
    	let if_block6 = /*POPUP*/ ctx[1].ADD_ROUND && create_if_block_2(ctx);
    	let if_block7 = /*POPUP*/ ctx[1].ROUND_DETAIL_POPUP && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			header.textContent = "Scoreboard";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			if (if_block6) if_block6.c();
    			t8 = space();
    			if (if_block7) if_block7.c();
    			add_location(header, file, 289, 1, 6749);
    			add_location(main, file, 288, 0, 6741);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(main, t1);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t2);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t3);
    			if (if_block2) if_block2.m(main, null);
    			append_dev(main, t4);
    			if (if_block3) if_block3.m(main, null);
    			append_dev(main, t5);
    			if (if_block4) if_block4.m(main, null);
    			append_dev(main, t6);
    			if (if_block5) if_block5.m(main, null);
    			append_dev(main, t7);
    			if (if_block6) if_block6.m(main, null);
    			append_dev(main, t8);
    			if (if_block7) if_block7.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*SCREEN*/ ctx[2].HOME_SCREEN) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*SCREEN*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_10(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*SCREEN*/ ctx[2].ADD_PLAYER_SCREEN) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*SCREEN*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_9(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*SCREEN*/ ctx[2].GAME_STAT_SCREEN) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*SCREEN*/ 4) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_8(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*SCREEN*/ ctx[2].ROUND_DETAIL_SCREEN) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*SCREEN*/ 4) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_7(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(main, t5);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*POPUP*/ ctx[1].NEW_PLAYER) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*POPUP*/ 2) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_6(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(main, t6);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*POPUP*/ ctx[1].EXISTING_PLAYER) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*POPUP*/ 2) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_3(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(main, t7);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*POPUP*/ ctx[1].ADD_ROUND) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*POPUP*/ 2) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_2(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(main, t8);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*POPUP*/ ctx[1].ROUND_DETAIL_POPUP) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty[0] & /*POPUP*/ 2) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(main, null);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const APP_NAME = 'SCOREBOARD_APP';

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let state = { "players": [], "games": [] };

    	const POPUP = {
    		NEW_PLAYER: false,
    		EXISTING_PLAYER: false,
    		ADD_ROUND: false,
    		ROUND_DETAIL_POPUP: false
    	};

    	const SCREEN = {
    		HOME_SCREEN: false,
    		ADD_PLAYER_SCREEN: false,
    		GAME_STAT_SCREEN: false,
    		ROUND_DETAIL_SCREEN: false
    	};

    	let newPlayer = {
    		id: '',
    		name: '',
    		score: 0,
    		saveForFuture: false
    	};

    	let existingPlayerSelected = [];
    	let currentGame;
    	let newRound = {};
    	let selectedRoundForDetail = {};

    	onMount(() => {
    		if (!getDb()) {
    			updateDb();
    		}

    		$$invalidate(0, state = getDb());
    		const InProgressGame = state.games.filter(game => game.state === 'In Progress' || game.state === 'Preparing');

    		if (InProgressGame.length) {
    			$$invalidate(5, currentGame = InProgressGame[0]);

    			if (currentGame.state === 'In Progress') {
    				navigateTo('GAME_STAT_SCREEN');
    			} else {
    				navigateTo('ADD_PLAYER_SCREEN');
    			}
    		} else {
    			navigateTo('HOME_SCREEN');
    		}
    	}); //clearAppData();
    	// state.games = [];
    	// window.localStorage.setItem(APP_NAME,JSON.stringify(state));

    	const startNewGame = () => {
    		let new_game = {
    			id: generateGameId(),
    			state: 'Preparing',
    			players: [],
    			rounds: []
    		};

    		$$invalidate(5, currentGame = new_game);
    		state.games.push(new_game);
    		$$invalidate(0, state);
    		updateDb();
    		navigateTo('ADD_PLAYER_SCREEN');
    	};

    	const addNewPLayer = () => {
    		togglePopup('NEW_PLAYER');
    	};

    	const getExistingPlayers = () => {
    		togglePopup('EXISTING_PLAYER');
    	};

    	const deleteNewPlayer = id => {
    		$$invalidate(5, currentGame.players = currentGame.players.filter(player => player.id !== id), currentGame);
    		$$invalidate(5, currentGame);
    		$$invalidate(0, state.games = state.games.filter(game => game.id !== currentGame.id), state);
    		state.games.push(currentGame);
    		updateDb();
    	};

    	const deleteExistingPlayer = id => {
    		$$invalidate(0, state.players = state.players.filter(player => player.id !== id), state);
    		$$invalidate(0, state);
    		updateDb();
    	};

    	const newPlayerSave = () => {
    		if (newPlayer.name) {
    			$$invalidate(3, newPlayer.id = generatePlayerId(), newPlayer);

    			if (newPlayer.saveForFuture) {
    				delete newPlayer.score;
    				state.players.push(JSON.parse(JSON.stringify(newPlayer)));
    			}

    			delete newPlayer.saveForFuture;
    			$$invalidate(3, newPlayer.score = 0, newPlayer);
    			currentGame.players.push(JSON.parse(JSON.stringify(newPlayer)));
    			$$invalidate(5, currentGame);
    			$$invalidate(0, state.games = state.games.filter(game => game.id !== currentGame.id), state);
    			state.games.push(currentGame);
    			$$invalidate(0, state);
    			updateDb();
    			togglePopup('NEW_PLAYER');

    			$$invalidate(3, newPlayer = {
    				id: '',
    				name: '',
    				score: 0,
    				saveForFuture: false
    			});
    		}
    	};

    	const newPlayerCancel = () => {
    		togglePopup('NEW_PLAYER');
    	};

    	const existingPlayerCancel = () => {
    		$$invalidate(4, existingPlayerSelected = []);
    		togglePopup('EXISTING_PLAYER');
    	};

    	const existingPlayerSave = () => {
    		for (let existingPlayer of existingPlayerSelected) {
    			let player = JSON.parse(JSON.stringify(existingPlayer));
    			player.score = 0;
    			currentGame.players.push(player);
    		}

    		$$invalidate(4, existingPlayerSelected = []);
    		$$invalidate(5, currentGame);
    		$$invalidate(0, state.games = state.games.filter(game => game.id !== currentGame.id), state);
    		state.games.push(currentGame);
    		$$invalidate(0, state);
    		updateDb();
    		togglePopup('EXISTING_PLAYER');
    	};

    	const selectExistingPlayer = event => {
    		if (event.target.checked) {
    			existingPlayerSelected.push(state.players.filter(player => player.id === event.target.name)[0]);
    		} else {
    			$$invalidate(4, existingPlayerSelected = existingPlayerSelected.filter(player => player.id !== event.target.name));
    		}

    		$$invalidate(4, existingPlayerSelected);
    	};

    	const goToGameScreen = () => {
    		$$invalidate(5, currentGame.state = 'In Progress', currentGame);
    		$$invalidate(5, currentGame);
    		$$invalidate(0, state.games = state.games.filter(game => game.id !== currentGame.id), state);
    		state.games.push(currentGame);
    		$$invalidate(0, state);
    		updateDb();
    		navigateTo('GAME_STAT_SCREEN');
    	};

    	const goToAddPlayerScreen = () => {
    		$$invalidate(5, currentGame.state = 'Preparing', currentGame);
    		$$invalidate(5, currentGame);
    		$$invalidate(0, state.games = state.games.filter(game => game.id !== currentGame.id), state);
    		state.games.push(currentGame);
    		$$invalidate(0, state);
    		updateDb();
    		navigateTo('ADD_PLAYER_SCREEN');
    	};

    	const addNewRound = () => {
    		togglePopup('ADD_ROUND');
    	};

    	const saveNewRound = () => {
    		if (Object.keys(newRound).length !== currentGame.players.length) {
    			alert('Please add score for All Players');
    			return;
    		}

    		for (let player_id in newRound) {
    			currentGame.players.filter(player => player.id === player_id)[0].score += Number(newRound[player_id]);
    		}

    		currentGame.players.sort(function (first, second) {
    			return first.score - second.score;
    		});

    		currentGame.rounds.push(JSON.parse(JSON.stringify(newRound)));
    		$$invalidate(5, currentGame);
    		$$invalidate(0, state.games = state.games.filter(game => game.id !== currentGame.id), state);
    		state.games.push(currentGame);
    		updateDb();
    		togglePopup('ADD_ROUND');
    	};

    	const cancelNewRound = () => {
    		newRound = {};
    		togglePopup('ADD_ROUND');
    	};

    	const updatePlayerScore = event => {
    		if (event.target.value || !isNaN(event.target.value)) {
    			newRound[event.target.name] = event.target.value;
    		} else {
    			delete newRound[event.target.name];
    		}
    	};

    	const completeGame = () => {
    		$$invalidate(5, currentGame.state = 'Completed', currentGame);
    		$$invalidate(5, currentGame);
    		$$invalidate(0, state.games = state.games.filter(game => game.id !== currentGame.id), state);
    		state.games.push(currentGame);
    		updateDb();
    		navigateTo('HOME_SCREEN');
    	};

    	const goToRoundDetailScreen = index => {
    		navigateTo('ROUND_DETAIL_SCREEN');
    	};

    	const openRoundDetail = round => {
    		$$invalidate(6, selectedRoundForDetail = JSON.parse(JSON.stringify(round)));
    		togglePopup('ROUND_DETAIL_POPUP');
    	};

    	const closeRoundDetail = () => {
    		togglePopup('ROUND_DETAIL_POPUP');
    	};

    	const togglePopup = popupToToggle => {
    		$$invalidate(1, POPUP[popupToToggle] = !POPUP[popupToToggle], POPUP);
    	};

    	const navigateTo = screenToNavigate => {
    		for (let screen in SCREEN) {
    			$$invalidate(2, SCREEN[screen] = false, SCREEN);
    		}

    		$$invalidate(2, SCREEN[screenToNavigate] = true, SCREEN);
    	};

    	const getDb = () => {
    		if (!window.localStorage.getItem(APP_NAME)) return;
    		return JSON.parse(window.localStorage.getItem(APP_NAME));
    	};

    	const updateDb = () => {
    		window.localStorage.setItem(APP_NAME, JSON.stringify(state));
    	};

    	const clearAppData = () => {
    		window.localStorage.removeItem(APP_NAME);
    		$$invalidate(0, state = { "players": [], "games": [] });
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const func = (player, plr) => plr.id === player.id;

    	function input0_input_handler() {
    		newPlayer.name = this.value;
    		$$invalidate(3, newPlayer);
    	}

    	function input1_change_handler() {
    		newPlayer.saveForFuture = this.checked;
    		$$invalidate(3, newPlayer);
    	}

    	const func_1 = player => deleteExistingPlayer(player.id);

    	$$self.$capture_state = () => ({
    		onMount,
    		generatePlayerId,
    		generateGameId,
    		Popup,
    		Icon,
    		Badge,
    		StartScreen,
    		AddPlayerScreen,
    		GameStatsScreen,
    		RoundsDetailScreen,
    		APP_NAME,
    		state,
    		POPUP,
    		SCREEN,
    		newPlayer,
    		existingPlayerSelected,
    		currentGame,
    		newRound,
    		selectedRoundForDetail,
    		startNewGame,
    		addNewPLayer,
    		getExistingPlayers,
    		deleteNewPlayer,
    		deleteExistingPlayer,
    		newPlayerSave,
    		newPlayerCancel,
    		existingPlayerCancel,
    		existingPlayerSave,
    		selectExistingPlayer,
    		goToGameScreen,
    		goToAddPlayerScreen,
    		addNewRound,
    		saveNewRound,
    		cancelNewRound,
    		updatePlayerScore,
    		completeGame,
    		goToRoundDetailScreen,
    		openRoundDetail,
    		closeRoundDetail,
    		togglePopup,
    		navigateTo,
    		getDb,
    		updateDb,
    		clearAppData
    	});

    	$$self.$inject_state = $$props => {
    		if ('state' in $$props) $$invalidate(0, state = $$props.state);
    		if ('newPlayer' in $$props) $$invalidate(3, newPlayer = $$props.newPlayer);
    		if ('existingPlayerSelected' in $$props) $$invalidate(4, existingPlayerSelected = $$props.existingPlayerSelected);
    		if ('currentGame' in $$props) $$invalidate(5, currentGame = $$props.currentGame);
    		if ('newRound' in $$props) newRound = $$props.newRound;
    		if ('selectedRoundForDetail' in $$props) $$invalidate(6, selectedRoundForDetail = $$props.selectedRoundForDetail);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		state,
    		POPUP,
    		SCREEN,
    		newPlayer,
    		existingPlayerSelected,
    		currentGame,
    		selectedRoundForDetail,
    		startNewGame,
    		addNewPLayer,
    		getExistingPlayers,
    		deleteNewPlayer,
    		deleteExistingPlayer,
    		newPlayerSave,
    		newPlayerCancel,
    		existingPlayerCancel,
    		existingPlayerSave,
    		selectExistingPlayer,
    		goToGameScreen,
    		goToAddPlayerScreen,
    		addNewRound,
    		saveNewRound,
    		cancelNewRound,
    		updatePlayerScore,
    		completeGame,
    		goToRoundDetailScreen,
    		openRoundDetail,
    		closeRoundDetail,
    		clearAppData,
    		func,
    		input0_input_handler,
    		input1_change_handler,
    		func_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
