import { addTodo, listTodos } from './todos'
import { rapGenerate, rapPreview } from './rap'

export default {
  listTodos,
  addTodo,
  rap: {
    generate: rapGenerate,
    preview: rapPreview,
  },
}
