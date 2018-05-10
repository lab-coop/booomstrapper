import test from 'ava'

import { addSequenceItem, runSequence } from './SeqenceRunner'

test('added sequence item should be called if runSequence is called', async t => {
  let wasSequenceItemCalled = false
  addSequenceItem(() => wasSequenceItemCalled = true, 'This should be called')
  await runSequence()
  t.true(wasSequenceItemCalled, 'Added sequence item was not called!')
})
