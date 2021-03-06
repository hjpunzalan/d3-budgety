import { db } from './vendor';
import './main.scss';
import './graph';

(function() {
	const form = document.querySelector('form');
	const name: HTMLInputElement | null = document.querySelector('#name');
	const cost: HTMLInputElement | null = document.querySelector('#cost');
	const error = document.querySelector('#error');

	form &&
		form.addEventListener('submit', e => {
			e.preventDefault();

			if (name && name.value && cost && cost.value) {
				const item = {
					name: name.value,
					cost: parseInt(cost.value)
				};

				db.collection('expenses')
					.add(item)
					.then((res: any) => {
						form.reset();
						error ? (error.textContent = null) : null;
					});
			} else {
				error
					? (error.textContent = 'Please enter the value before submitting')
					: null;
			}
		});
})();
