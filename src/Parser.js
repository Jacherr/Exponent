const fetch = require('node-fetch');
const discord = require('eris');

const preParseTags = ['ignore', 'note'];
const postParseTags = ['attach', 'iscript'];

const token = require('./configs/tokenConf.json').apis
const superagent = require('superagent');
const rexLangs = ['c#', 'visualbasic', 'vb', 'f#', 'java', 'python2', 'python2.7', 'py2.7', 'py2', 'c(gcc)', 'c', 'c++(gcc)', 'c++', 'cpp', 'php', 'php7', 'pascal', 'objective-c', 'oc', 'haskell', 'hs', 'ruby', 'rb', 'perl', 'lua', 'assembly', 'asm', 'sqlserver', 'javascript', 'js', 'commonlisp', 'lisp', 'prolog', 'go', 'scala', 'scheme', 'node.js', 'node', 'python', 'python3', 'py', 'py3', 'octave', 'c(clang)', 'c++(clang)', 'c++(vc++)', 'c(vc)', 'd', 'r', 'tcl', 'mysql', 'postgresql', 'psql', 'postgres', 'oracle', 'swift', 'bash', 'ada', 'erlang', 'elixir', 'ex', 'ocaml', 'kotlin', 'kot', 'brainfuck', 'bf', 'fortran', 'fort'];

class Parser {
	constructor(client, context) {
		this.client = client;
		this.context = context;

		this.stackSize = 0;
		this.rexCalls = 0;
		this.hasteCalls = 0;

		this.attachments = [];
		this.imagescripts = [];

		this.nsfw = false;

		this.variables = new Map();
	}
	async parse(input, tagArgs, tag) {
		this.stackSize = 0;
		this.rexCalls = 0;
		this.hasteCalls = 0;
		try {
			const result = await this.subParse(input, tagArgs, tag, false, true);
			return { success: true, nsfw: this.nsfw, attachments: this.attachments, imagescripts: this.imagescripts, result: Parser.unescapeTag(result).replace(/\\{/g, '{').replace(/\\}/g, '}') };
		} catch (err) {
			return { success: false, nsfw: false, attachments: [], imagescripts: [], result: `:warning: ${err.message}` };
		}
	}
	async subParse(input, tagArgs, tag, filter, initial) {
		this.stackSize++;
		if (this.stackSize > 1000)
			throw new Error(`Stack size exceeded at: \`${input}\``);

		if (initial) input = await this.subParse(input, tagArgs, tag, preParseTags);

		let tagEnd, tagStart;

		for (let i = 0; i < input.length; i++) {

			if (input[i] === '}' && (input[i + 1] !== '\\' && input[i - 1] !== '\0')) {
				tagEnd = i;

				for (let e = tagEnd; e >= 0; e--) {
					if (input[e] === '{' && (input[i - 1] !== '\\' && input[e + 1] !== '\0')) {
						tagStart = e + 1;

						const toParse = input.slice(tagStart, tagEnd).trim();

						const split = toParse.split(':');
						const tagName = split.shift();

						if (filter && !filter.includes(tagName)) continue;
						if (!filter && postParseTags.includes(tagName)) continue;

						const rawArgs = split.join(':').replace(/\\\|/g, '\0|');
						const args = [];

						let currentArg = '';
						for (let i = 0; i < rawArgs.length; i++) {
							if (rawArgs[i] === '|' && rawArgs[i - 1] !== '\0') {
								args.push(currentArg);
								currentArg = '';
							} else currentArg += rawArgs[i];
						}

						if (currentArg) args.push(currentArg);

						const before = input.substring(0, tagStart - 1);
						const after = input.substring(tagEnd + 1, input.length);

						const tagResult = Parser.escapeTag(((await this.getData(tagName, rawArgs, args, tagArgs, tag)) || '').toString());

						input = before + tagResult + after;
						i = before.length + tagResult.length - 1;
						break;
					}
				}
			}
		}

		if (initial) input = await this.subParse(input, tagArgs, tag, postParseTags);

		return input;
	}
	async getData(key, rawArgs, splitArgs, args, tag) {
		key = key.trim();
		rawArgs = rawArgs.trim();
		splitArgs = splitArgs.map(arg => arg.trim());

		switch (key) {
			case 'user':
			case 'username': {
				const member = rawArgs ? this.context.getMemberFromString(rawArgs) : (this.context.message && this.context.message.member);
				return member ? member.user.username : '';
			}

			case 'discrim':
			case 'discriminator': {
				const member = rawArgs ? this.context.getMemberFromString(rawArgs) : (this.context.message && this.context.message.member);
				return member ? member.user.discriminator : '';
			}

			case 'tag':
			case 'mention': {
				const member = rawArgs ? this.context.getMemberFromString(rawArgs) : (this.context.message && this.context.message.member);
				return member ? member.user.tag : '';
			}

			case 'id':
			case 'userid': {
				const member = rawArgs ? this.context.getMemberFromString(rawArgs) : (this.context.message && this.context.message.member);
				return member && member.user.id;
			}

			case 'avatar': {
				const member = rawArgs ? this.context.getMemberFromString(rawArgs) : (this.context.message && this.context.message.member);
				return member ? member.user.displayAvatarURL({
					format: (member.user.avatar || '').startsWith('a_') ? 'gif' : 'png',
					size: 2048
				}) : '';
			}

			case 'randuser':
				return this.context.message && (this.context.message.guild ? this.context.message.guild.members.random().user.username : this.context.message.author.username);

			case 'randchannel':
				return this.context.message && `#${this.context.message.guild ? this.context.message.guild.channels.random().name : this.context.message.author.username}`;

			case 'tagname':
				return tag.name;

			case 'tagowner':
				return (await this.client.users.fetch(tag.owner)).tag;

			case 'dm':
				if (!this.context.message) return 'N/A';
				return this.context.message.guild ? 0 : 1;

			case 'channels':
				if (!this.context.message || !this.context.message.guild) return 'N/A';
				return this.context.message.guild.channels.size;

			case 'members':
			case 'servercount':
				if (!this.context.message || !this.context.message.guild) return 'N/A';
				return this.context.message.guild.memberCount;

			case 'messageid':
				if (!this.context.message) return 'N/A';
				return this.context.message.id;

			case 'owner':
				if (!this.context.message || !this.context.message.guild) return 'N/A';
				return this.context.message.guild.owner.user.tag;

			case 'serverid':
				if (!this.context.message || !this.context.message.guild) return 'N/A';
				return this.context.message.guild.id;

			case 'server':
				if (!this.context.message || !this.context.message.guild) return 'N/A';
				return this.context.message.guild.name;

			case 'channelid':
				if (!this.context.message) return 'N/A';
				return this.context.message.channel.id;

			case 'channel':
				if (!this.context.message) return 'N/A';
				return this.context.message.channel.name;

			case 'nick':
			case 'nickname': {
				const member = rawArgs ? this.context.getMemberFromString(rawArgs) : (this.context.message && this.context.message.member);
				return member && (member.nickname || member.user.username);
			}

			case 'me':
				return this.client.user.username;

			case 'prefix':
				return (this.context.message && this.context.message.prefixUsed) || 'N/A';

			case 'range': {
				const lower = Math.min(...splitArgs) || 0;
				const upper = Math.max(...splitArgs) || 0;
				return Math.round(Math.random() * (upper - lower)) + lower;
			}

			case 'random':
			case 'choose':
				return splitArgs[Math.floor(Math.random() * splitArgs.length)];

			case 'select': {
				if (isNaN(splitArgs[0])) return;
				const index = parseInt(splitArgs.shift());
				return splitArgs[index];
			}

			case 'set': {
				this.variables.set(splitArgs.shift(), splitArgs.join(':'));
				return;
			}

			case 'get': {
				return this.variables.get(splitArgs.shift()) || '';
			}

			case 'attach':
			case 'file':
				if (!splitArgs.length) return;
				this.attachments.push({ url: splitArgs[0], name: splitArgs[1] });
				return;

			case 'iscript':
			case 'imagescript':
				if (!splitArgs.length) return 'https://gitlab.com/snippets/1736663';
				this.imagescripts.push({ script: splitArgs[0], name: splitArgs[1] });
				return;

			case 'image':
			case 'lastimage': {
				try {
					const images = await this.context.imageFetchUtil.fetchImages(rawArgs);
					return images[0] || '';
				} catch (err) {
					return '';
				}
			}

			case 'note':
				return;

			case 'eval':
				return await this.subParse(rawArgs.replace(/\0/g, ''), args);

			case 'args':
				return args.join(' ');

			case 'arg': {
				if (isNaN(splitArgs[0])) return;
				const index = parseInt(splitArgs[0]);
				return args[index];
			}

			case 'argslen':
			case 'argslength':
			case 'argscount':
				return args.length;

			case 'replace': {
				const [replace, replacement, text] = splitArgs;
				return (text || '').replace(new RegExp(replace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement || '');
			}

			case 'replaceregex': {
				const [replace, replacement, text, flags] = splitArgs;
				return (text || '').replace(new RegExp(replace, flags || 'g'), replacement || '');
			}

			case 'upper':
				return rawArgs.toUpperCase();

			case 'lower':
				return rawArgs.toLowerCase();

			case 'trim':
				return rawArgs.trim();

			case 'length':
				return rawArgs.length;

			case 'url':
				return encodeURI(rawArgs);

			case 'urlc':
			case 'urlcomponent':
				return encodeURIComponent(rawArgs);

			case 'date':
			case 'time': {
				let [format, offset, timeOverride] = splitArgs;
				if (!format) return '';

				offset = offset ? Parser.timespanToMillis(offset) : 0;

				const time = (timeOverride ? parseInt(timeOverride) : Date.now()) + offset;
				const date = new Date(time);

				if (!date.valueOf()) return '';
				if (['unix', 'ms'].includes(format)) return date.valueOf();

				const fullMonth = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getUTCMonth()];
				const abbrMonth = fullMonth.slice(0, 3);

				const fullDoW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()];
				const abbrDoW = fullDoW.slice(0, 3);

				let result = '';

				const getReplacement = match => {
					switch (match) {
						case 'CCCC':
							return Math.floor(date.getUTCFullYear() / 100) + 1;
						case 'YYYY':
							return date.getUTCFullYear();
						case 'YY':
							return date.getUTCFullYear().toString().slice(-2);
						case 'MMMM':
							return fullMonth;
						case 'MMM':
							return abbrMonth;
						case 'MM':
							return `${date.getUTCMonth() < 9 ? '0' : ''}${date.getUTCMonth() + 1}`;
						case 'M':
							return date.getUTCMonth() + 1;
						case 'DDDD':
							return fullDoW;
						case 'DDD':
							return abbrDoW;
						case 'DD':
							return `${date.getUTCDate() < 10 ? '0' : ''}${date.getUTCDate()}`;
						case 'D':
							return date.getUTCDate();
						case 'hh':
							return `${date.getUTCHours() < 10 ? '0' : ''}${date.getUTCHours()}`;
						case 'h':
							return date.getUTCHours();
						case 'mm':
							return `${date.getUTCMinutes() < 10 ? '0' : ''}${date.getUTCMinutes()}`;
						case 'm':
							return date.getUTCMinutes();
						case 'ssss':
							return date.getUTCMilliseconds();
						case 'ss':
							return `${date.getUTCSeconds() < 10 ? '0' : ''}${date.getUTCSeconds()}`;
						case 's':
							return date.getUTCSeconds();
						default:
							return match;
					}
				};

				for (const match of format.match(/(C|Y|M|D|h|m|s)\1+|./g))
					result += getReplacement(match);

				return result;
			}

			case 'joined':
			case 'jointime': {
				const member = splitArgs[1] ? this.context.getMemberFromString(splitArgs[1]) : (this.context.message && this.context.message.member);
				if (!member) return '';

				if (splitArgs[0] === 'discord')
					return discord.SnowflakeUtil.deconstruct(member.user.id).date.valueOf();

				else if (splitArgs[0] === 'server')
					return member.joinedTimestamp;

				else return '';
			}

			case 'abs':
			case 'absolute': {
				if (isNaN(rawArgs)) return;
				return Math.abs(parseFloat(rawArgs));
			}

			case 'pi':
				return Math.PI;

			case 'e':
				return Math.E;

			case 'min':
				return Math.min(...splitArgs);

			case 'max':
				return Math.max(...splitArgs);

			case 'round':
				return Math.round(rawArgs);

			case 'ceil':
				return Math.ceil(rawArgs);

			case 'floor':
				return Math.floor(rawArgs);

			case 'sign':
				return Math.sign(rawArgs);

			case 'sin':
				return Math.sin(rawArgs);

			case 'cos':
				return Math.cos(rawArgs);

			case 'tan':
				return Math.tan(rawArgs);

			case 'sqrt':
				return Math.sqrt(rawArgs);

			case 'root': {
				if (isNaN(splitArgs[0])) return;
				if (isNaN(splitArgs[1])) return;

				const root = parseFloat(splitArgs.shift());
				const num = parseFloat(splitArgs.shift());

				return num ** (1 / root);
			}

			case 'math': {
				if (!isNaN(rawArgs)) return parseFloat(rawArgs).toString();

				if (/[^+\-*^/()0-9.% ]/g.test(rawArgs)) throw new Error(`Invalid term \`${rawArgs}\``);
				try {
					return eval(rawArgs.replace(/\^/g, '**').replace(/([^\d]?)0(\d+)/g, (match, b, a) => b + a)).toString();
				} catch (err) {
					throw new Error(`Failed to calculate term \`${rawArgs}\``);
				}
			}

			case 'if': {
				const value = splitArgs.shift();
				const operator = splitArgs.shift();
				const compareValue = splitArgs.shift();
				let onMatch, onNoMatch;

				for (const part of splitArgs) {
					const splitPart = part.split(':');
					const action = splitPart.shift();
					if (action === 'then') onMatch = splitPart.join(':');
					if (action === 'else') onNoMatch = splitPart.join(':');
				}

				const result = Parser.compareLogic(value, compareValue, operator);
				this.lastIfResult = result;
				return result ? onMatch : onNoMatch;
			}

			case 'then':
				if (this.lastIfResult === undefined) return '';
				return this.lastIfResult ? rawArgs : '';

			case 'else':
				if (this.lastIfResult === undefined) return '';
				return this.lastIfResult ? '' : rawArgs;

			case 'codeblock':
				return `\`\`\`${rawArgs.replace(/`/g, '`\u200b')}\`\`\``;

			case 'code':
				return `\`${rawArgs.replace(/`/g, '')}\``;

			case 'bold':
				return `**${rawArgs.replace(/\*{2}/g, '')}**`;

			case 'strikethrough':
				return `~~${rawArgs.replace(/~/g, '')}~~`;

			case 'limit':
				return (splitArgs[0] || '').slice(0, parseInt(splitArgs[1]) || 2000);

			case 'ignore':
				return Parser.escapeTag(rawArgs);

			case 'nsfw':
				if (rawArgs === 'test') return 'nsfw';
				this.nsfw = true;
				return '';

			case 'ping': {
				switch (rawArgs) {
					case 'sql':
					case 'sqldrift': {
						if (!this.sqlLatency) {
							const sqlStart = Date.now();
							const { now: sqlNow } = (await this.client.commandHandler.queryDatabase('SELECT now()'))[0];
							const sqlEnd = Date.now();

							this.sqlLatency = sqlEnd - sqlStart;
							this.sqlDrift = Date.now() - new Date(sqlNow).valueOf();
						}

						if (rawArgs === 'sqldrift') return this.sqlDrift;
						return this.sqlLatency;
					}

					default:
						return Math.round(this.client.ping);
				}
			}

			case 'haste':
			case 'hastebin': {
				this.hasteCalls++;
				if (this.hasteCalls > 5) return '[TOO MANY HASTE CALLS]';

				const keyMatch = rawArgs.match(/^(https?:\/\/wrmsr\.io\/)?([a-z0-9]{8,12})$/i);
				if (keyMatch) return await Parser.retrieveHaste(keyMatch[keyMatch.length - 1]);
				else return await Parser.createHaste(rawArgs);
			}

			default:
				if (rexLangs.includes(key)) {
					if (!rawArgs) return;

					this.rexCalls++;
					if (this.rexCalls > 2) return '[TOO MANY REX CALLS]';

					const rexResult = await superagent
                    .post('https://fapi.wrmsr.io/rextester')
                    .set({
                        "Content-Type": "application/json",
						Authorization: token.fapi
                    })
                    .send({
						args: {
							language: key,
							text: Parser.unescapeTag(rawArgs)
						}
                    })

					return Parser.escapeTag(rexResult);
				}

				return `{${key}${rawArgs ? `:${rawArgs}` : ''}}`;
		}
	}

	static timespanToMillis(timespan) {
		if (!timespan) return 0;

		let offset = 0;

		const months = Parser.extractNumber(timespan.match(/(\d+)mo/g));
		const millis = Parser.extractNumber(timespan.match(/(\d+)ms/g));

		const years = Parser.extractNumber(timespan.match(/(\d+)y/g));
		const weeks = Parser.extractNumber(timespan.match(/(\d+)w/g));
		const days = Parser.extractNumber(timespan.match(/(\d+)d/g));
		const hours = Parser.extractNumber(timespan.match(/(\d+)h/g));
		const minutes = Parser.extractNumber(timespan.match(/(\d+)m[^s]?/g));
		const seconds = Parser.extractNumber(timespan.match(/(\d+)s/g));

		offset += millis;
		offset += seconds * 1000;
		offset += minutes * 60 * 1000;
		offset += hours * 60 * 60 * 1000;
		offset += days * 24 * 60 * 60 * 1000;
		offset += weeks * 7 * 24 * 60 * 60 * 1000;
		offset += months * 30 * 24 * 60 * 60 * 1000;
		offset += years * 365 * 24 * 60 * 60 * 1000;

		if (timespan[0] === '-') offset *= -1;

		return offset;
	}

	static extractNumber(matches) {
		return (matches || [])
			.map(val => {
				return (val
					.match(/\d+/g) || [])[0];
			})
			.reduce((prev, curr) => prev + parseInt(curr), 0);
	}

	static compareLogic(value, compareValue, operator) {
		switch (operator) {
			case '=':
			case '==':
				return value === compareValue; // equal

			case '!':
			case '!=':
				return value !== compareValue; // not equal

			case '~':
				return (value || '').toLowerCase() === (compareValue || '').toLowerCase(); // equal ignore case

			case '>':
				return value > compareValue; // gt

			case '<':
				return value < compareValue; // lt

			case '>=':
				return value >= compareValue; // gt or equal

			case '<=':
				return value <= compareValue; // lt or equal

			case '?': {
				const regex = new RegExp(compareValue);
				return regex.test(value); // regex match
			}

			default:
				throw new Error(`Invalid if operator: \`${operator}\``);
		}
	}

	static escapeTag(tag) {
		return tag.replace(/{/g, '{\0').replace(/}/g, '\0}').replace(/\|/g, '\0|');
	}

	static unescapeTag(tag) {
		return tag.replace(/\0/g, '');
	}

	static async createHaste(content) {
		const { key } = await fetch('https://wrmsr.io/documents', { method: 'POST', body: content }).then(res => res.json());
		return `https://wrmsr.io/${key}`;
	}

	static async retrieveHaste(key) {
		const { data } = await fetch(`https://wrmsr.io/documents/${key}`).then(res => res.json());
		return data === undefined ? '[HASTE NOT FOUND]' : data;
	}
}

export default Parser;
