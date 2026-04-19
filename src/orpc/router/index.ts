import { addTodo, listTodos } from './todos'
import { rapGenerate } from './rap'

export default {
  listTodos,
  addTodo,
  rap: {
    generate: rapGenerate,
  },
}
