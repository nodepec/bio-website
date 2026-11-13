import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execute, complete, tokenize, resolveRoute, formatUptime } from '../src/commands.ts';

const context = { route: 'skills', theme: 'blue', effects: true, startedAt: 0, now: 3661000, history: ['whoami', 'ls'] };

test('quoted and escaped arguments preserve literal text without evaluation', () => {
  assert.deepEqual(tokenize('echo "hello world" \'a b\' c\\ d ""'), ['echo', 'hello world', 'a b', 'c d', '']);
  const payload = '<img src=x onerror=alert(1)>; $(whoami)';
  assert.equal(execute(`echo '${payload}'`, context).text, payload);
  assert.equal(execute('echo "unfinished', context).error, true);
});

test('navigation supports original filenames, directories, and the home path', () => {
  for (const [command, route] of [['cat profile.txt', 'profile'], ['cd projects/', 'projects'], ['open ~/skills.json', 'skills'], ['cd ~/', 'profile'], ['cd ..', 'profile'], ['cd .', 'skills']]) {
    assert.deepEqual(execute(command, context).action, { type: 'navigate', route });
  }
  assert.equal(execute('cat missing.md', context).error, true);
  assert.equal(execute('cat', context).error, true);
  assert.equal(execute('open profile extra', context).error, true);
});

test('untrusted file names cannot resolve through object prototypes', () => {
  for (const name of ['__proto__', 'constructor', 'toString', 'https://example.com', '../../etc/passwd']) {
    assert.equal(resolveRoute(name), undefined);
    assert.equal(execute(`cat ${name}`, context).error, true);
  }
});

test('preferences only accept supported values', () => {
  assert.deepEqual(execute('theme ice', context).action, { type: 'theme', theme: 'ice' });
  assert.deepEqual(execute('effects off', context).action, { type: 'effects', enabled: false });
  for (const command of ['theme neon', 'theme ice extra', 'effects maybe', 'effects off extra']) assert.equal(execute(command, context).error, true);
  assert.match(execute('theme', context).text, /blue/);
});

test('completion is contextual and keeps shell commands separate from system execution', () => {
  assert.deepEqual(complete('who'), ['whoami']);
  assert.deepEqual(complete('theme c'), ['theme cobalt']);
  assert.ok(complete('cat abo').includes('cat about.md'));
  assert.deepEqual(complete('effects o'), ['effects on', 'effects off']);
  assert.equal(execute('sudo rm -rf /', context).error, true);
  assert.match(execute('ping', context).text, /No ping was sent/);
});

test('time, history, and empty input have defined output', () => {
  assert.equal(formatUptime(3661000), '1h 1m 1s');
  assert.equal(formatUptime(-1), '0m 0s');
  assert.equal(execute('pwd', context).text, '/home/nodepec/skills');
  assert.match(execute('history', context).text, /1  whoami\n\s*2  ls/);
  assert.deepEqual(execute('   ', context), { text: '' });
  assert.deepEqual(execute('clear', context).action, { type: 'clear' });
});
