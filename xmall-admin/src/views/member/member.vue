<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.userRole" placeholder="会员类型" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in userRoleOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-input v-model="listQuery.phone" placeholder="会员手机" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
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
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="加入时间" align="center" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="微信昵称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.nickName!=null? row.nickName :"未授权" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="真实姓名" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员类型" min-width="150px">
        <template slot-scope="{row}">
          <el-tag>{{ row.userRole | userRoleFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="小区名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.house!=null?row.house.houseName:"" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详细地址" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.houseDetail }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电话" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.contactName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="380" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="medium" type="danger" @click="handleRole(row, -1)">
            设置角色及姓名
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="设置角色" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="选择角色" prop="userRole">
          <el-select v-model="temp.userRole" class="filter-item" placeholder="请选择">
            <el-option
              v-for="item in userRoleOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="真实姓名" prop="userName">
          <el-input v-model="temp.realName" prop="realName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="setUserRole()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, setUserRole } from '@/api/member'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const userRoleOptions = [
  { key: 'user', display_name: '普通用户' },
  { key: 'staff', display_name: '工作人员' },
  { key: 'agent', display_name: '代理' }
]

const statusKeyValue = userRoleOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'BageManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    userRoleFilter(key) {
      return statusKeyValue[key]
    }
  },
  data() {
    return {
      userRoleOptions,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        phone: undefined,
        userRole: undefined,
        sort: '-id'
      },
      temp: {
        userRole: '',
        realName: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        nuserRoleum: [{ required: true, message: '必填项', trigger: 'change' }]
      }
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
    handleRole(row) {
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
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
    // 设置角色

    setUserRole() {
      const temp = this.temp
      setUserRole(temp).then(() => {
        // this.list.unshift(this.temp)
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list.splice(index, 1, this.temp) // 更新列表数据
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '角色设置成',
          type: 'success',
          duration: 2000
        })
      })
    }

  }
}
</script>
