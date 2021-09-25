<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.userName" placeholder="会员名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.userNo" placeholder="会员编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
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
      <el-table-column label="加入时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.joinTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员编号" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.userNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员姓名" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电话" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag>
            {{ row.sex | sexFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="余额" width="110px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleBalanceLog(row)">{{ row.balance }}</span>
        </template>
      </el-table-column>
      <el-table-column label="积分" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="生日" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.joinTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleAddBalance(row)">
            充值
          </el-button>
          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">
            积分
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="temp.userName" />
        </el-form-item>
        <el-form-item label="编号" prop="userNo">
          <el-input v-model="temp.userNo" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="temp.sex" class="filter-item" placeholder="Please select">
            <el-option v-for="(item, i) in sexOptions" :key="item" :label="item" :value="i" />
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="temp.birthday" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="加入日期" prop="joinTime">
          <el-date-picker v-model="temp.joinTime" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="temp.address" />
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

    <el-dialog :visible.sync="dialogBalanceVisible" title="余额增加">
      <el-form ref="balanceForm" :rules="balanceRules" :model="balanceTemp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="balanceTemp.userName" :disabled="true" />
        </el-form-item>
        <el-form-item label="新增余额" prop="balance">
          <el-input v-model.number="balanceTemp.balance" placeholder="填入数字，负数为扣减" />
        </el-form-item>
        <el-form-item label="赠送余额" prop="rewardBalance">
          <el-input v-model.number="balanceTemp.rewardBalance" placeholder="填入数字，负数为扣减" />
        </el-form-item>
        <el-form-item label="充值日期" prop="addTime">
          <el-date-picker v-model="balanceTemp.addTime" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input v-model="balanceTemp.note" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogBalanceVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="addBalance()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
    <!-- 余额充值记录-->
    <el-dialog :visible.sync="dialogBalanceLogVisible" :title="currentRow!==null ?(currentRow.userName+'的充值记录'):'充值记录'">
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="balanceLogList"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
          <template slot-scope="{row}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="充值时间" width="150px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.addTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="充值金额" min-width="150px">
          <template slot-scope="{row}">
            <span>{{ row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column label="赠送金额" min-width="150px">
          <template slot-scope="{row}">
            <span>{{ row.rewardBalance }}</span>
          </template>
        </el-table-column>
        <el-table-column label="获取积分" width="110px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column label="说明" width="150px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.note }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="balanceLogTotal>0" :total="balanceLogTotal" :page.sync="balanceLogQuery.page" :limit.sync="balanceLogQuery.limit" @pagination="getBalanceLogList" />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogBalanceLogVisible = false">Confirm</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, fetchPv, createUser, updateUser, hiddenUser, getUserByNo, addBalance, balanceLog } from '@/api/member'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'UserManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    sexFilter(sex) {
      const sexArr = ['保密', '男', '女']
      return sexArr[sex]
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
    var checkUserNo = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('编号不能为空'))
      }
      // 查询测试批次号是否重复
      getUserByNo(value).then(res => {
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
      sexOptions: ['保密', '男', '女'],
      role: ['admin'],
      tableKey: 0,
      list: null,
      balanceLogList: null,
      total: 0,
      balanceLogTotal: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userName: undefined,
        userNo: undefined,
        sort: '-id'
      },
      currentRow: null,
      balanceLogQuery: {
        page: 1,
        limit: 10,
        userId: undefined,
        direction: 1,
        sort: '-id'
      },
      temp: {
        id: undefined,
        userName: '',
        userNo: '',
        phone: '',
        birthday: '',
        joinTime: '',
        sex: 0,
        address: '',
        balance: 0,
        score: 0
      },
      balanceTemp: {
        id: undefined,
        userId: '',
        userName: '',
        balance: 0,
        rewardBalance: 0,
        score: 0,
        note: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogBalanceVisible: false,
      dialogBalanceLogVisible: false,
      pvData: [],
      rules: {
        userName: [{ required: true, message: '必填项', trigger: 'change' }],
        userNo: [{ required: true, message: '必填项', trigger: 'change' }, { validator: checkUserNo, trigger: 'blur' }, { min: 6, max: 6, message: '会员编号长度为6位', trigger: 'change' }],
        phone: [{ validator: checkPhone, trigger: 'blur' }],
        sex: [{ required: true, message: '必填项', trigger: 'change' }],
        birthday: [{ type: 'date', required: true, message: '必填项', trigger: 'change' }],
        address: [{ required: true, message: '必填项', trigger: 'change' }, { min: 1, max: 100, message: '长度在 100个字符内', trigger: 'blur' }]
      },
      balanceRules: {
        balance: [{ required: true, message: '必填项', trigger: 'change' }, { type: 'number', message: '必须为数字值' }],
        rewardBalance: [{ required: true, message: '必填项', trigger: 'change' }, { type: 'number', message: '必须为数字值' }],
        addTime: [{ type: 'date', required: true, message: '必填项', trigger: 'change' }],
        note: [{ required: true, message: '必填项', trigger: 'blur' }]
      },
      downloadLoading: false
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
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
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
        userName: '',
        userNo: '',
        sex: 0,
        phone: '',
        birthday: '',
        joinTime: '',
        balance: 0,
        score: 0,
        address: ''
      }
    },
    resetBalanceTemp(row) {
      this.balanceTemp = {
        id: undefined,
        userId: row.id,
        userName: row.userName,
        balance: 0,
        rewardBalance: 0,
        score: 0,
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
          createUser(this.temp).then(() => {
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
          updateUser(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp) // 更新列表数据
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
        hiddenUser(row).then(() => {
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
    // 打开添加余额窗口
    handleAddBalance(row) {
      this.resetBalanceTemp(row)
      this.dialogBalanceVisible = true
      this.$nextTick(() => {
        this.$refs['balanceForm'].clearValidate()
      })
    },
    // 新增余额

    addBalance() {
      const temp = this.balanceTemp
      this.balanceTemp.score = temp.balance
      this.$refs['balanceForm'].validate((valid) => {
        if (valid) {
          addBalance(this.balanceTemp).then(() => {
            // this.list.unshift(this.temp)
            this.getList()
            this.dialogBalanceVisible = false
            this.$notify({
              title: '成功',
              message: '余额添加成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },

    // 个人余额充值明细
    handleBalanceLog(row) {
      this.currentRow = row
      this.dialogBalanceLogVisible = true
      this.getBalanceLogList()
    },

    getBalanceLogList() {
      this.listLoading = true
      this.balanceLogQuery.userId = this.currentRow.id
      balanceLog(this.balanceLogQuery).then(response => {
        this.balanceLogList = response.data.items
        this.balanceLogTotal = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['会员名', '编号', '性别', '电话', '地址', '生日', '加入日期', '余额', '积分']
        const filterVal = ['userName', 'userNo', 'sex', 'phone', 'address', 'birthday', 'joinTime', 'balance', 'score']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'birthday' || j === 'joinTime') {
          return parseTime(v[j])
        } else {
          if (j === 'sex') {
            return this.sexOptions[v[j]]
          } else {
            return v[j]
          }
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
