import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { PieArcDatum } from 'd3';
import d3SVGLegend from 'd3-svg-legend';

declare const db: any;

interface pieData {
	id: string;
	name: string;
	cost: number;
}

interface PathElement extends SVGPathElement {
	_current: PieArcDatum<pieData>;
}

export default (function() {
	const dims = { height: 300, width: 300, radius: 150 }; // dimension of the pie chart
	// 5px extra
	const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };
	const svg = d3
		.select('.canvas')
		.append('svg')
		.attr('width', dims.width + 150) // 150px extra for legend
		.attr('height', dims.height + 150); // 150px extra for legend

	const graph = svg
		.append('g')
		.attr('transform', `translate(${cent.x}, ${cent.y})`);

	const pie = d3
		.pie<pieData>()
		.sort(null) // prevents default sorting
		.value(d => d.cost);

	const arcPath = d3
		.arc<PieArcDatum<pieData>>()
		.outerRadius(dims.radius)
		.innerRadius(dims.radius / 2);

	// ordinal scale
	const colour = d3.scaleOrdinal(d3['schemeSet2']);

	const legendGroup = svg
		.append('g')
		.attr('transform', `translate(${dims.width + 40}, 10)`); // setting the position

	const legend = d3SVGLegend
		.legendColor()
		.shape('circle')
		.shapePadding(10)
		.scale(colour); // match to colour scale

	const tip = (d3Tip as Function)()
		.attr('class', 'tip card')
		.html((d: PieArcDatum<pieData>) => {
			let content = `<div class="name">${d.data.name}</div>`;
			content += `<div class="cost">$${d.data.cost}</div>`;
			content += `<div class="delete">Click slice to delete</div>`;
			return content;
		});
	graph.call(tip); // apply tip to all graph group

	// update function
	const update = (data: pieData[]): void => {
		// update colour scale domain
		colour.domain(data.map(d => d.name));

		// update and call legend
		legendGroup.call(<any>legend); // need type
		legendGroup.selectAll('text').attr('fill', 'white');

		// join enhanced (pie) data to path element
		const paths = graph.selectAll<PathElement, pieData>('path').data(pie(data));

		// handle exit selection
		paths
			.exit<PieArcDatum<pieData>>()
			.transition()
			.duration(750) // 750ms
			.attrTween('d', arcTweenExit)
			.remove();

		// handle current selection
		// Only need to update data as there won't be any paths on the template.html
		// Updates data of all paths
		paths
			.attr('d', arcPath)
			.transition()
			.duration(750)
			.attrTween('d', arcTweenUpdate);

		// handle enter selection
		paths
			.enter()
			.append<PathElement>('path')
			.attr('class', 'arc')
			.attr('stroke', '#fff')
			.attr('stroke-width', 3)
			.attr('fill', d => colour(d.data.name))
			.each(function(d) {
				this._current = d;
			})
			.transition()
			.duration(750) // 750ms
			.attrTween('d', arcTweenEnter);

		// add events
		graph
			.selectAll<PathElement, PieArcDatum<pieData>>('path')
			.on(
				'mouseover',
				(
					d: PieArcDatum<pieData>,
					i: number,
					n: ArrayLike<PathElement> | NodeListOf<PathElement>
				) => {
					tip.show(d, n[i]); // n[i] same as this
					handleMouseOver(d, i, n);
				}
			)
			.on(
				'mouseout',
				(
					d: PieArcDatum<pieData>,
					i: number,
					n: ArrayLike<PathElement> | NodeListOf<PathElement>
				) => {
					tip.hide(); // n[i] same as this
					handleMouseOut(d, i, n);
				}
			)
			.on('click', handleClick);
	};

	let data: pieData[] = [];
	db.collection('expenses').onSnapshot((res: any) => {
		res.docChanges().forEach((change: any) => {
			const doc = { ...change.doc.data(), id: change.doc.id };
			switch (change.type) {
				case 'added':
					data.push(doc);
					break;
				case 'modified':
					const index = data.findIndex(item => item.id === doc.id);
					data[index] = doc;
					break;
				case 'removed':
					data = data.filter(item => item.id !== doc.id);
					break;
				default:
					break;
			}
		});
		update(data);
	});

	const arcTweenEnter = (d: PieArcDatum<pieData>) => {
		let i = d3.interpolate(d.endAngle, d.startAngle);

		return function(t: number) {
			d.startAngle = i(t);
			return String(arcPath(d));
		};
	};

	const arcTweenExit = (d: PieArcDatum<pieData>) => {
		let i = d3.interpolate(d.startAngle, d.endAngle);

		return function(t: number) {
			d.startAngle = i(t);
			return String(arcPath(d));
		};
	};
	// use function keyword so 'this' will be dynamically scoped
	// Using updated data
	function arcTweenUpdate(this: PathElement, d: PieArcDatum<pieData>) {
		// interpolate between the two objects and not just angles because interpolation may happen in two of the angles or one
		let i = d3.interpolate(this._current, d);

		// update the current prop with the new updated data for future changes
		this._current = i(1); // or d

		return function(t: number) {
			return String(arcPath(i(t)));
		};
	}
	// event handlers
	const handleMouseOver = (
		d: PieArcDatum<pieData>,
		i: number,
		n: ArrayLike<PathElement> | NodeListOf<PathElement>
	): void => {
		d3.select(n[i])
			.style('cursor', 'pointer')
			.transition('changeSliceFill') // added name to prevent affecting other transitions such as entering and exiting
			.duration(200)
			.attr('fill', '#fff');
	};
	const handleMouseOut = (
		d: PieArcDatum<pieData>,
		i: number,
		n: ArrayLike<PathElement> | NodeListOf<PathElement>
	): void => {
		d3.select(n[i])
			.transition('changeSliceFill') // added name to prevent affecting other transitions such as entering and exiting
			.duration(200)
			.attr('fill', colour(d.data.name));
	};

	const handleClick = (d: PieArcDatum<pieData>) => {
		const id = d.data.id;
		db.collection('expenses')
			.doc(id)
			.delete();
	};
})();
