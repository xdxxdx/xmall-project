<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-date-picker v-model="listQuery.startTime" type="datetime" placeholder="生成时间从" value-format="yyyy-MM-dd HH:mm:ss" />
      <el-date-picker v-model="listQuery.endTime" type="datetime" placeholder="到" value-format="yyyy-MM-dd HH:mm:ss" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="二维码(可点击跳转去生成)" min-width="150px">
        <template slot-scope="{row}">
          <a target="_blank" href="https://cli.im/"><span class="link-type">{{ row.bagCode }}</span></a>
        </template>
      </el-table-column>
      <el-table-column label="二维码" min-width="150px">
        <template slot-scope="{row}">
          <tableErCodePop :text="row.bagCode + '' " :smallsize="80" />
        </template>
      </el-table-column>

      <el-table-column label="状态" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.title }}</span>
          <el-tag>{{ row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="medium" type="danger" @click="handleStatus(row,$index)">
            设置状态
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="生成个数" prop="num">
          <el-input v-model.number="temp.num" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="设置状态" :visible.sync="setStatusVisible">
      <el-form ref="dataForm1" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="选择状态" prop="status">
          <el-select v-model="bag.status" class="filter-item" placeholder="请选择">
            <el-option
              v-for="item in statusOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setStatusVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="setBagStatus()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, batchCreate, setBagStatus } from '@/api/bag'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import TableErCodePop from '@/components/ErCode/TableErCodePop'

const statusOptions = [
  { key: 0, display_name: '未审核' },
  { key: 1, display_name: '已印刷' },
  { key: 2, display_name: '使用中' },
  { key: 3, display_name: '已核销' }
]

const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'BageManage',
  components: { Pagination, TableErCodePop
  },
  directives: { waves },
  filters: {
    statusFilter(key) {
      return statusKeyValue[key]
    }
  },
  data() {
    return {
      statusOptions,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        status: undefined,
        startTime: undefined,
        endTime: undefined,
        sort: '-id'
      },
      temp: {
        num: 1
      },
      bag: {

      },
      dialogFormVisible: false,
      setStatusVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        num: [{ required: true, message: '必填项', trigger: 'change' },
          { type: 'number', message: '必须为数字值' }]
      },
      downloadLoading: false,
      multipleSelection: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        num: 1
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          batchCreate(this.temp.num).then(() => {
            // this.list.unshift(this.temp)
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(val)
    },
    handleStatus(row) {
      this.bag = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.setStatusVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm1'].clearValidate()
      })
    },
    setBagStatus() {
      const bag = this.bag
      setBagStatus(bag).then(() => {
        // this.list.unshift(this.temp)
        const index = this.list.findIndex(v => v.id === this.bag.id)
        this.list.splice(index, 1, this.bag) // 更新列表数据
        this.setStatusVisible = false
        this.$notify({
          title: '成功',
          message: '状态更新成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
