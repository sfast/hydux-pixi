import { render, domApi, h } from '../vdom'
import * as assert from 'assert'
import * as fs from 'fs'
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM(`<!DOCTYPE html><head></head><body></body>`)
const document = dom.window.document
global['document'] = document
function testTrees(name, trees) {
  it(name, done => {
    trees.map(tree => {
      render(tree.node, document.body, domApi)
      assert.equal(document.body.innerHTML, tree.html.replace(/\s{2,}/g, ''))
      tree.assert && tree.assert()
    })
    done()
  })
}
let res = [] as string[]
;(assert as any).deepEqual = function (vnodes) {
  res.push(JSON.stringify(vnodes, null, 2))
}
describe('desc', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  after(() => {
    fs.writeFileSync('./test.txt', res.join('\n\n'))
  })

  it('positional string/number children', () => {
    assert.deepEqual(h('div', {}, 'foo', 'bar', 'baz'), {
      name: 'div',
      attributes: {},
      children: ['foo', 'bar', 'baz'],
    })

    assert.deepEqual(h('div', {}, 0, 'foo', 1, 'baz', 2), {
      name: 'div',
      attributes: {},
      children: [0, 'foo', 1, 'baz', 2],
    })

    assert.deepEqual(h('div', {}, 'foo', h('div', {}, 'bar'), 'baz', 'quux'), {
      name: 'div',
      attributes: {},
      children: [
        'foo',
        {
          name: 'div',
          attributes: {},
          children: ['bar'],
        },
        'baz',
        'quux',
      ],
    })
  })

  it('skip null and boolean children', () => {
    const expected = {
      name: 'div',
      attributes: {},
      children: [],
    }

    assert.deepEqual(h('div', {}, true), expected)
    assert.deepEqual(h('div', {}, false), expected)
    assert.deepEqual(h('div', {}, null), expected)
  })

  testTrees('replace element', [
    {
      node: h('main', {}),
      html: `<main></main>`,
    },
    {
      node: h('div', {}),
      html: `<div></div>`,
    },
  ])

  testTrees('insert children on top', [
    {
      node: h('main', {}, [
        h(
          'div',
          {
            key: 'a',
            id: 'a',
          },
          'A',
        ),
      ]),
      html: `
        <main>
          <div id="a">A</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [
        h(
          'div',
          {
            key: 'b',
            id: 'b',
          },
          'B',
        ),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `
        <main>
          <div id="b">B</div>
          <div id="a">A</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [
        h(
          'div',
          {
            key: 'c',
            id: 'c',
          },
          'C',
        ),
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `
        <main>
          <div id="c">C</div>
          <div id="b">B</div>
          <div id="a">A</div>
        </main>
      `,
    },
  ])

  testTrees('remove text node', [
    {
      node: h('main', {}, [h('div', {}, ['foo']), 'bar']),
      html: `
        <main>
          <div>foo</div>
          bar
        </main>
      `,
    },
    {
      node: h('main', {}, [h('div', {}, ['foo'])]),
      html: `
        <main>
          <div>foo</div>
        </main>
      `,
    },
  ])

  testTrees('keyed', [
    {
      node: h('main', {}, [
        h(
          'div',
          {
            key: 'a',
            id: 'a',
          },
          'A',
        ),
        h(
          'div',
          {
            key: 'b',
            id: 'b',
          },
          'B',
        ),
        h(
          'div',
          {
            key: 'c',
            id: 'c',
          },
          'C',
        ),
        h(
          'div',
          {
            key: 'd',
            id: 'd',
          },
          'D',
        ),
        h(
          'div',
          {
            key: 'e',
            id: 'e',
          },
          'E',
        ),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div id="b">B</div>
          <div id="c">C</div>
          <div id="d">D</div>
          <div id="e">E</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'd', id: 'd' }, 'D'),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div id="c">C</div>
          <div id="d">D</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [h('div', { key: 'd', id: 'd' }, 'D')]),
      html: `
        <main>
          <div id="d">D</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [
        h(
          'div',
          {
            key: 'a',
            id: 'a',
          },
          'A',
        ),
        h(
          'div',
          {
            key: 'b',
            id: 'b',
          },
          'B',
        ),
        h(
          'div',
          {
            key: 'c',
            id: 'c',
          },
          'C',
        ),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h(
          'div',
          {
            key: 'e',
            id: 'e',
          },
          'E',
        ),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div id="b">B</div>
          <div id="c">C</div>
          <div id="d">D</div>
          <div id="e">E</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'c', id: 'c' }, 'C'),
        h('div', { key: 'b', id: 'b' }, 'B'),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `
        <main>
          <div id="d">D</div>
          <div id="c">C</div>
          <div id="b">B</div>
          <div id="a">A</div>
        </main>
      `,
    },
  ])

  testTrees('mixed keyed/non-keyed', [
    {
      node: h('main', {}, [
        h(
          'div',
          {
            key: 'a',
            id: 'a',
          },
          'A',
        ),
        h('div', {}, 'B'),
        h('div', {}, 'C'),
        h(
          'div',
          {
            key: 'd',
            id: 'd',
          },
          'D',
        ),
        h(
          'div',
          {
            key: 'e',
            id: 'e',
          },
          'E',
        ),
      ]),
      html: `
        <main>
          <div id="a">A</div>
          <div>B</div>
          <div>C</div>
          <div id="d">D</div>
          <div id="e">E</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'e', id: 'e' }, 'E'),
        h('div', {}, 'C'),
        h('div', {}, 'B'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'a', id: 'a' }, 'A'),
      ]),
      html: `
        <main>
          <div id="e">E</div>
          <div>C</div>
          <div>B</div>
          <div id="d">D</div>
          <div id="a">A</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [
        h('div', {}, 'C'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', { key: 'a', id: 'a' }, 'A'),
        h('div', { key: 'e', id: 'e' }, 'E'),
        h('div', {}, 'B'),
      ]),
      html: `
        <main>
          <div>C</div>
          <div id="d">D</div>
          <div id="a">A</div>
          <div id="e">E</div>
          <div>B</div>
        </main>
      `,
    },
    {
      node: h('main', {}, [
        h('div', { key: 'e', id: 'e' }, 'E'),
        h('div', { key: 'd', id: 'd' }, 'D'),
        h('div', {}, 'B'),
        h('div', {}, 'C'),
      ]),
      html: `
        <main>
          <div id="e">E</div>
          <div id="d">D</div>
          <div>B</div>
          <div>C</div>
        </main>
      `,
    },
  ])

  testTrees('removeAttribute', [
    {
      node: h('div', { id: 'foo', class: 'bar' }),
      html: `<div id="foo" class="bar"></div>`,
    },
    {
      node: h('div', null),
      html: `<div></div>`,
    },
  ])

  testTrees('skip setAttribute for functions', [
    {
      node: h('div', {
        onclick() {
          // ignore
        },
      }),
      html: `<div></div>`,
    },
  ])

  testTrees('setAttribute true', [
    {
      node: h('div', {
        enabled: true,
      }),
      html: `<div enabled="true"></div>`,
    },
  ])

  testTrees('update element with dynamic props', [
    {
      node: h('input', {
        type: 'text',
        value: 'foo',
      }),
      html: `<input type="text" value="foo">`,
    },
    {
      node: h('input', {
        type: 'text',
        value: 'bar',
      }),
      html: `<input type="text" value="bar">`,
      assert() {
        assert.equal(document.querySelector('input')!.value, 'bar')
      },
    },
  ])

  testTrees('input list attribute', [
    {
      node: h('input', {
        list: 'foobar',
      }),
      html: `<input list="foobar">`,
    },
  ])

  it('event handlers', () => {
    render(
      h('button', {
        onclick(event) {
          //
        },
      }),
      document.body,
      domApi,
    )
  })
})
