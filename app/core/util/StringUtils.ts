import * as striptags from 'striptags';


export class StringUtils {
	static toSnakeCase(input: string): string {
		const result = input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
			.map(x => x.toLowerCase());
		return result.join('_');
	}

	static thousandSeparator(number, separator: string = '.') {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
	}

	static countWords(string: string): number {
		let str = striptags(string, [], '');
		str = str.replace(/(^\s*)|(\s*$)/gi, '');
		str = str.replace(/[ ]{2,}/gi, ' ');
		str = str.replace(/\n /, '\n');
		if (!str || str === '') return 0;
		return str.split(' ').length;
	}

	static matchKeywords(keywords: string[], string: string): number {
		let matchCount = 0;
		const str = striptags(string, [], '');
		keywords.forEach(keyword => {
			if (str.toLowerCase().includes(keyword.toLowerCase())) matchCount += 1;
		});

		return matchCount;
	}

	static setCleanContent(string: string) {
		return striptags(string, [], '');
	}

	static jsonToInlineParams(json: any) {
		let inlineParams = '';
		for (const [key, value] of Object.entries(json)) {
			if (inlineParams) inlineParams += '&';
			inlineParams += `${key}=${value}`;
		}
		return inlineParams;
	}

	static includesArray(sentence: string, words: string[]) {
		for (const word of words) {
			if (sentence.includes(word)) return true;
		}
		return false;
	}

	static trimChar(words: string, trims: string[]) {
		for (const trimWord of trims) {
			words = this.replaceAll(words, trimWord, '');
		}
		return words.trim();
	}
	static replaceAll(words, search, replacement) {
		return words.split(search).join(replacement);
	};

}

