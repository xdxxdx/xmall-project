<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.commodityName" placeholder="会员名称" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column label="商品名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.commodityName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品类别" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.category.categoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品单位" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.commodityUnit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交货周期(天)" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.deliveryCycle }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.note }}</span>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 600px; margin-left:50px;">
        <el-form-item label="商品类别" prop="categoryId">
          <el-select v-model="temp.categoryId" placeholder="请选择">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.categoryName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="commodityName">
          <el-input v-model="temp.commodityName" />
        </el-form-item>
        <el-form-item label="商品单位" prop="commodityUnit">
          <el-input v-model="temp.commodityUnit" />
        </el-form-item>
        <el-form-item label="交货周期" prop="deliveryCycle">
          <el-input v-model.number="temp.deliveryCycle" />
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input v-model="temp.note" />
        </el-form-item>
        <el-button type="primary" class="add-spec-btn" icon="el-icon-edit" @click="addSpec">新增规格</el-button>
        <div class="divide" />
        <div v-for="(item, index) in temp.specs" :key="item.specId" class="spec-list-wrap">
          <el-form-item class="spec-form-item" label="名称" :prop="'specs.' + index +'.specName'" :rules="specRules.specName">
            <el-input v-model="item.specName" placeholder="规格名称" class="el-select_box" />
          </el-form-item>
          <el-form-item class="spec-form-item" label="价格:" :prop="'specs.'+ index +'.price'" :rules="specRules.price">
            <el-input v-model.number="item.price" placeholder="请输入价格" />
          </el-form-item>
          <el-button class="remove-spec-btn" @click="removeSpec(item, index)">删除</el-button>
        </div>

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
import { fetchList, fetchPv, createCommodity, updateCommodity, hiddenCommodity } from '@/api/commodity'
import { fetchList as categoryList } from '@/api/category'
import { deleteSpec } from '@/api/spec'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'CommodityManage',
  components: { Pagination },
  directives: { waves },
  filters: {

  },
  data() {
    return {
      categoryList: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        commodityName: undefined,
        sort: '-id'
      },
      currentRow: null,
      temp: {
        id: undefined,
        categoryId: '',
        commodityName: '',
        commodityUnit: '',
        deliveryCycle: '',
        specs: [{
          specId: '',
          specName: '',
          price: ''
        }]
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      pvData: [],
      rules: {
        commodityName: [{ required: true, message: '必填项', trigger: 'change' }],
        categoryId: [{ required: true, message: '必填项', trigger: 'change' }],
        commodityUnit: [{ required: true, message: '必填项', trigger: 'change' }],
        deliveryCycle: [{ type: 'number', message: '必须为数字值' }]
      },
      // 规格校验
      specRules: {
        specName: [{ required: true, message: '必填', trigger: 'change' }
        ],
        price: [
          { type: 'number', message: '请输入数字' }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getCategoryList()
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
    getCategoryList() {
      categoryList({}).then(response => {
        this.categoryList = response.data.items
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
        categoryId: '',
        commodityName: '',
        commodityUnit: '',
        deliveryCycle: '',
        specs: [{
          specId: '',
          specName: '',
          price: ''
        }]
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
      console.log(this.temp.specs)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createCommodity(this.temp).then(() => {
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
          updateCommodity(tempData).then(() => {
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
        hiddenCommodity(row).then(() => {
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
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商品名称', '商品分类', '商品单位', '交货周期', '备注']
        const filterVal = ['commodityName', 'categoryName', 'commodityUnit', 'deliveryCycle']
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
    },
    removeSpec(item) {
      var index = this.temp.specs.indexOf(item)
      if (index !== -1) {
        if (item.id !== null && item.id !== '' && item.id !== undefined) {
          console.log(item.id + '从数据库删除')
          this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteSpec(item).then(() => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.temp.specs.splice(index, 1)
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
        } else {
          this.temp.specs.splice(index, 1)
        }
      }
    },
    addSpec() {
      this.temp.specs.push({
        specName: '',
        price: ''
      })
    }
  }
}
</script>
<style scoped>
  .add-spec-btn{
    margin-bottom: 10px;
  }
  .divide{
    border-bottom: 1px solid #eee;
    margin: 10px;
  }
  .remove-spec-btn{
    position:absolute;
    right: -40px;
  }
  .spec-list-wrap{
    width: 100%;
    position: relative;
  }
  .spec-list-wrap .spec-form-item{
    display: inline-block;
    width: 46%;
  }
</style>
