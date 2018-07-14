const dom = new Proxy({}, {
	get: (target, key, receiver) =>
		(attrs = {}, children = [], evts = {}) =>
		{
			let attributes_passed = !(attrs instanceof Array);

			if(!attributes_passed)
			{
				evts = children;
				children = attrs;
			}

			if((typeof children === 'string') && (!attributes_passed || Object.keys(attrs).length === 0))
				return children;

			let shouldInsert = child => (typeof child === 'string' || typeof child == 'boolean' || typeof child == 'number');

			var el = document.createElement(key);

			for(let child of children)
				if(shouldInsert(child))
					el.insertAdjacentHTML('beforeend', child);
				else
					if(child instanceof Array)
						child.forEach(c =>
						{
							if(shouldInsert(c))
								el.insertAdjacentHTML('beforeend', c);
							else
								el.appendChild(c);
						});
					else
						el.appendChild(child);

			if(attributes_passed)
				for(let key in attrs)
					el.setAttribute(key, attrs[key]);

			for(let evt in evts)
				if(evt == 'sub_events')
					for(let ev in evts[evt])
						el.querySelectorAll(ev).forEach(sub_el => {
							sub_el.addEventListener(evts[evt][ev].type, evts[evt][ev].func);
						});
				else
				if(evt == 'after')
					evts[evt](el);
				else
					el.addEventListener(evt, evts[evt]);

			return el;
		}
}); 