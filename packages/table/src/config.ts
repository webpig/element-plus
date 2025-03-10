import { getPropByPath } from '@element-plus/utils/util'
import ElCheckbox from '@element-plus/checkbox'
import { h } from 'vue'
import { Store, TreeNode, AnyObject, TableColumnCtx } from './table.type'

export const cellStarts = {
  default: {
    order: '',
  },
  selection: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: '',
    className: 'el-table-column--selection',
  },
  expand: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: '',
  },
  index: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: '',
  },
}

// 这些选项不应该被覆盖
export const cellForced = {
  selection: {
    renderHeader: function ({ store: store_ }) {
      const store = store_ as Store
      return h(ElCheckbox, {
        disabled:
          store.states.data.value && store.states.data.value.length === 0,
        indeterminate:
          store.states.selection.value.length > 0 &&
          !store.states.isAllSelected.value,
        onClick: store.toggleAllSelection,
        modelValue: store.states.isAllSelected.value,
      })
    },
    renderCell: function ({
      row: row_,
      column: column_,
      store: store_,
      index_: $index_,
    }) {
      const store = store_ as Store
      const row = row_ as AnyObject
      const column = column_ as TableColumnCtx
      const index_ = $index_ as string
      return h(ElCheckbox, {
        disabled: column.selectable
          ? !column.selectable.call(null, row, index_)
          : false,
        onInput: () => {
          store.commit('rowSelectedChanged', row)
        },
        nativeOnClick: (event: Event) => event.stopPropagation(),
        modelValue: store.isSelected(row),
      })
    },
    sortable: false,
    resizable: false,
  },
  index: {
    renderHeader: function ({ column: column_ }) {
      const column = column_ as TableColumnCtx
      return column.label || '#'
    },
    renderCell: function ({ index_: $index_, column: column_ }) {
      const index_ = $index_ as string
      const column = column_ as TableColumnCtx
      let i = index_ + 1
      const index = column.index

      if (typeof index === 'number') {
        i = index_ + index
      } else if (typeof index === 'function') {
        i = index(index_)
      }
      return h('div', {}, [i])
    },
    sortable: false,
  },
  expand: {
    renderHeader: function ({ column: column_ }) {
      const column = column_ as TableColumnCtx
      return column.label || ''
    },
    renderCell: function ({ row: row_, store: store_ }) {
      const store = store_ as Store
      const row = row_ as AnyObject
      const classes = ['el-table__expand-icon']
      if (store.states.expandRows.value.indexOf(row) > -1) {
        classes.push('el-table__expand-icon--expanded')
      }
      const callback = function (e) {
        e.stopPropagation()
        store.toggleRowExpansion(row)
      }
      return h(
        'div',
        {
          class: classes,
          onClick: callback,
        },
        [
          h('i', {
            class: 'el-icon el-icon-arrow-right',
          }),
        ],
      )
    },
    sortable: false,
    resizable: false,
    className: 'el-table__expand-column',
  },
}

export function defaultRenderCell({
  row: row_,
  column: column_,
  index_: $index_,
}) {
  const row = row_ as AnyObject
  const column = column_ as TableColumnCtx
  const index_ = $index_ as string
  const property = column.property
  const value = property && getPropByPath(row, property, false).v
  if (column && column.formatter) {
    return column.formatter(row, column, value, index_)
  }
  return value
}

export function treeCellPrefix({
  row: row_,
  treeNode: treeNode_,
  store: store_,
}) {
  const row = row_ as AnyObject
  const store = store_ as Store
  const treeNode = treeNode_ as TreeNode
  if (!treeNode) return null
  const ele = []
  const callback = function (e) {
    e.stopPropagation()
    store.loadOrToggle(row)
  }
  if (treeNode.indent) {
    ele.push(
      h('span', {
        class: 'el-table__indent',
        style: { 'padding-left': treeNode.indent + 'px' },
      }),
    )
  }
  if (typeof treeNode.expanded === 'boolean' && !treeNode.noLazyChildren) {
    const expandClasses = [
      'el-table__expand-icon',
      treeNode.expanded ? 'el-table__expand-icon--expanded' : '',
    ]
    let iconClasses = ['el-icon-arrow-right']
    if (treeNode.loading) {
      iconClasses = ['el-icon-loading']
    }

    ele.push(
      h(
        'div',
        {
          class: expandClasses,
          onClick: callback,
        },
        [
          h('i', {
            class: iconClasses,
          }),
        ],
      ),
    )
  } else {
    ele.push(
      h('span', {
        class: 'el-table__placeholder',
      }),
    )
  }
  return ele
}
