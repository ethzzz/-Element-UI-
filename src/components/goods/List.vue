<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row :gutter="10">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <!-- 索引列 -->
        <el-table-column prop="#" type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="商品添加时间">
          <template v-slot="scope">{{scope.row.add_time|dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="icon-type-edit"
              @click="editGoodsDialog(scope.row)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="icon-type-delete"
              @click="removeGoodsById(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页功能  -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },

      //   商品数据列表
      goodsList: [],
      // 商品总数
      total: 0,
    };
  },
  created() {
    //   根据页码获取商品列表
    this.getGoodsList();
  },
  methods: {
    //   获取所有商品数据列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品数据列表失败！");
      }

      this.$message.success("获取商品数据列表成功！");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      // console.log(this.goodsList);
    },

    // --分页功能
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // --监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    

    // 添加按钮触发事件，跳转到添加商品页面
    goAddPage(){
        this.$router.push('/goods/add')
    },
    // 编辑按钮触发事件 根据id修改商品信息
    editGoodsDialog(){

    },
    // 删除按钮触发事件 根据id删除商品
    async removeGoodsById(id) {
      // console.log(id);
      // 弹出对话框提醒用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(confirmResult);
      // 如果用户确认删除，则返回字符串 confirm
      // 如果用户取消删除，则返回字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("您已取消删除操作");
      }
      // console.log('确认了删除');
      // 发出请求删除商品信息的请求
      const { data: res } = await this.$http.delete("goods/" + id);

      if (res.meta.status !== 200) {
        // 提示信息
        return this.$message.error("删除商品信息失败!");
      }
      // 提示信息
      this.$message.success("删除商品信息成功!");
      // 重新获取商品列表数据
      this.getGoodsList();
    },
  },
};
</script>

<style lang="less" scoped>
</style>