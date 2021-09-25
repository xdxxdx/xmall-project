<template>
  <div class="app-container">
    <div class="filter-container">
      <el-cascader v-model="provinceCityQuery" :options="provinceList" clearable />
      <el-input v-model="listQuery.houseName" placeholder="小区名称" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column label="小区名称" min-width="250px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.houseName }}</span>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 600px; margin-left:50px;">
        <el-form-item label="省市" prop="cityId" :error="errorCity">
          <el-cascader v-model="provinceCityForm" :options="provinceList" clearable @change="cascaderChange" @visible-change="cityChange($event,AREACODE)" />
        </el-form-item>
        <el-form-item label="小区名称" prop="houseName">
          <el-input v-model="temp.houseName" />
        </el-form-item>
        <el-form-item label="关联投放点" prop="points" @visible-change="pointChange($event,AREACODE)">
          <el-select v-model="temp.points" multiple placeholder="请选择">
            <el-option
              v-for="item in pointList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item></el-form>
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
import { fetchList, create, update, hidden } from '@/api/house'
import { provinceListWithCity } from '@/api/province'
import { fetchList as pointList } from '@/api/launchpoint'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'HouseManage',
  components: { Pagination },
  directives: { waves },
  filters: {

  },
  data() {
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
        cityId: '',
        houseName: undefined,
        sort: '-id'
      },
      temp: {
        id: undefined,
        provinceId: '',
        cityId: '',
        houseName: '',
        points: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      pvData: [],
      rules: {
        houseName: [{ required: true, message: '必填项', trigger: 'change' }]
      },
      downloadLoading: false,
      errorCity: '',
      pointList: []
    }
  },
  created() {
    this.getProvinceList()
    this.getList()
    this.getPointList()
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
    cityChange: function(callback, vc) { // 只有回调参数为false时才触发 ctx.getAreaListDataSearch(vc,1)这个函数;
      console.log('回调参数' + callback)
      if (callback) {
        this.getProvinceList()
      }
    },
    getProvinceList() {
      provinceListWithCity({}).then(response => {
        this.provinceList = response.data
      })
    },
    pointChange: function(callback, vc) { // 只有回调参数为false时才触发 ctx.getAreaListDataSearch(vc,1)这个函数;
      console.log('回调参数' + callback)
      if (callback) {
        this.getPointList()
      }
    },
    getPointList() {
      pointList({ cityId: this.temp.cityId, status: 1 }).then(response => {
        const pointList = response.data.items.map(function(item) {
          return {
            value: item.id,
            label: item.pointName
          }
        })
        this.pointList = pointList
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
        provinceId: '',
        cityId: '',
        houseName: '',
        points: []
      }
    },
    handleCreate() {
      if (this.provinceList.length > 0) {
        this.provinceList = []
      }
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
      if (this.provinceList.length === 0) {
        this.getProvinceList()
      }
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
    }
  }
}
</script>
