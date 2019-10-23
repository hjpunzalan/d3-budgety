import * as d3 from 'd3';

declare const db: any;

interface pieData {
	id: string;
	name: string;
	cost: number;
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
		.arc<d3.PieArcDatum<pieData>>()
		.outerRadius(dims.radius)
		.innerRadius(dims.radius / 2);

	// ordinal scale
	const colour = d3.scaleOrdinal(d3['schemeSet3']);

	// update function
	const update = (data: pieData[]): void => {
		// update colour scale domain
		colour.domain(data.map(d => d.name));

		// join enhanced (pie) data to path element
		const paths = graph.selectAll('path').data(pie(data));

		paths
			.enter()
			.append('path')
			.attr('class', 'arc')
			.attr('d', (d: d3.PieArcDatum<pieData>) => arcPath(d))
			.attr('stroke', '#fff')
			.attr('stroke-width', 3)
			.attr('fill', d => colour(d.data.name));
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
})();
