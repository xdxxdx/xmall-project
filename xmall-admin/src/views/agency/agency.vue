<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.agentName" placeholder="代理商名称" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
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
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属省份" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.province.provinceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属城市" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.city.cityName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理商名称" min-width="250px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.agentName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录账号" min-width="250px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.agentAccount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="150px">
        <template slot-scope="{row}">
          <el-tag>{{ row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="余额" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.balance }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电话" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.tel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="250px">
        <template slot-scope="{row}">
          <span>{{ row.note }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <!-- <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleAddBalance(row)">
            充值
          </el-button>
          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">
            积分
          </el-button> -->
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button v-if="row.status!=1" size="mini" type="success" @click="handleModifyStatus(row,1)">
            启用
          </el-button>
          <el-button v-if="row.status==1" size="mini" @click="handleModifyStatus(row, -1, $index)">
            冻结
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 600px; margin-left:50px;">
        <el-form-item label="省市" prop="cityId" :error="errorCity">
          <el-cascader v-model="provinceCityForm" :options="provinceList" clearable @change="cascaderChange" />
        </el-form-item>
        <el-form-item label="代理名称" prop="agentName">
          <el-input v-model="temp.agentName" />
        </el-form-item>
        <el-form-item label="登录账号" prop="agentAccount">
          <el-input v-model="temp.agentAccount" placeholder="不要超过10个字符,一经设定不能修改" :disabled="dialogStatus=='update'?'disabled':false" />
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="temp.tel" />
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input v-model="temp.note" :autosize="{ minRows: 2, maxRows: 4}" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, create, update, hidden, setStatus } from '@/api/agency'
import { provinceListWithCity } from '@/api/province'
import { adminByUserName } from '@/api/admin'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const statusOptions = [
  { key: '0', display_name: '未审核' },
  { key: '1', display_name: '已启用' },
  { key: '-1', display_name: '已冻结' }
]

const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'AgencyManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(key) {
      return statusKeyValue[key]
    }
  },
  data() {
    var checkPhone = (rule, value, callback) => {
      const phoneReg = /^1[3|4|5|7|8][0-9]{9}$/
      if (!value) {
        return callback(new Error('电话号码不能为空'))
      }
      setTimeout(() => {
        // Number.isInteger是es6验证数字是否为整数的方法,但是我实际用的时候输入的数字总是识别成字符串
        // 所以我就在前面加了一个+实现隐式转换

        if (!Number.isInteger(+value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (phoneReg.test(value)) {
            callback()
          } else {
            callback(new Error('电话号码格式不正确'))
          }
        }
      }, 100)
    }
    // 流水号校验
    var checkAccount = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('编号不能为空'))
      }
      // 查询测试批次号是否重复
      adminByUserName(value).then(res => {
        if (this.dialogStatus === 'create') {
          if (res.msg === 'no-exist') {
            callback()
          } else if (res.msg === 'exist') {
            callback('编号已经存在')
          } else {
            this.$notify.error({
              title: '失败',
              message: '系统问题，暂时无法查询编号是否重复！',
              duration: 2000
            })
          }
        } else {
          callback()
        }
      })
    }
    return {
      provinceList: [],
      provinceCityQuery: [],
      provinceCityForm: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        agentName: undefined,
        sort: '-id'
      },
      temp: {
        id: undefined,
        provinceId: '',
        cityId: '',
        agentName: '',
        agentAccount: '',
        tel: '',
        note: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        agentName: [{ required: true, message: '必填项', trigger: 'change' }],
        tel: [{ validator: checkPhone, trigger: 'blur' }],
        agentAccount: [{ required: true, message: '必填项', trigger: 'change' },
          { validator: checkAccount, trigger: 'change' }
        ]
      },
      downloadLoading: false,
      errorCity: ''
    }
  },
  created() {
    this.getProvinceList()
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.cityId = this.provinceCityQuery[1]
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getProvinceList() {
      provinceListWithCity({}).then(response => {
        this.provinceList = response.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      const rowTemp = {}
      row.status = status
      rowTemp.status = status
      rowTemp.id = row.id
      setStatus(rowTemp).then(() => {
        const index = this.list.findIndex(v => v.id === row.id)
        this.list.splice(index, 1, row) // 更新列表数据
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '设置成功',
          type: 'success',
          duration: 2000
        })
      })
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
        id: undefined,
        provinceId: '',
        cityId: '',
        agentName: '',
        agentAccount: '',
        tel: '',
        note: ''
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
          if (this.temp.cityId === '') {
            this.errorCity = '必填项'
            return false
          }
          create(this.temp).then(() => {
            // this.list.unshift(this.temp)
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.provinceCityForm[0] = this.temp.provinceId
      this.provinceCityForm[1] = this.temp.cityId
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          update(tempData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        hidden(row).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.list.splice(index, 1)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    cascaderChange() {
      this.temp.provinceId = this.provinceCityForm[0]
      this.temp.cityId = this.provinceCityForm[1]
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
