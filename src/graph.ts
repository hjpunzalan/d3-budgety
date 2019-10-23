import * as d3 from 'd3';

interface pieData {
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

	const angles = pie([
		{ name: 'rent', cost: 500 },
		{ name: 'bills', cost: 300 },
		{ name: 'gaming', cost: 200 }
	]);

	console.log(angles);
})();
