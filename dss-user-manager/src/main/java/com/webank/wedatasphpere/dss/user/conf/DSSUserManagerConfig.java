package com.webank.wedatasphpere.dss.user.conf;

import com.webank.wedatasphere.linkis.common.conf.CommonVars;

import java.util.ResourceBundle;

/**
 * @program: dss-appjoint-auth
 * @description: 用户模块配置文件
 * @author: luxl@chinatelecom.cn
 * @create: 2020-12-30 16:26
 **/


public class DSSUserManagerConfig {
//    private final static ResourceBundle resource = ResourceBundle.getBundle("linkis");
    public static final  String LOCAL_USER_ROOT_PATH = CommonVars.apply("wds.dss.user.root.dir","").getValue().trim();
    public static final String BDP_SERVER_MYBATIS_DATASOURCE_URL = CommonVars.apply("wds.linkis.server.mybatis.datasource.url", "").getValue().trim();
    public static final String BDP_SERVER_MYBATIS_DATASOURCE_USERNAME =  CommonVars.apply("wds.linkis.server.mybatis.datasource.username", "").getValue().trim();
    public static final String BDP_SERVER_MYBATIS_DATASOURCE_PASSWORD = CommonVars.apply("wds.linkis.server.mybatis.datasource.password", "").getValue().trim();
    public static final String SCHEDULER_ADDRESS = CommonVars.apply("wds.dss.appjoint.scheduler.azkaban.address", "").getValue().trim();
    public static final String USER_ACCOUNT_COMMANDS = CommonVars.apply("wds.dss.user.account.command.class", "").getValue().trim();

    public static final String METASTORE_HDFS_PATH = CommonVars.apply("wds.linkis.metastore.hive.hdfs.base.path", "").getValue().trim();
    public static final String METASTORE_SCRIPT_PAHT = CommonVars.apply("wds.linkis.metastore.script.path", "").getValue().trim();
    public static final String METASTORE_DB_TAIL = CommonVars.apply("wds.linkis.metastore.db.tail", "_default").getValue().trim();

    public static final String KERBEROS_REALM = CommonVars.apply("wds.linkis.kerberos.realm", "").getValue().trim();
    public static final String KERBEROS_ADMIN = CommonVars.apply("wds.linkis.kerberos.admin", "").getValue().trim();
    public static final String KERBEROS_SCRIPT_PATH = CommonVars.apply("wds.linkis.kerberos.script.path", "").getValue().trim();
    public static final String KERBEROS_KEYTAB_PATH = CommonVars.apply("wds.linkis.kerberos.keytab.path", "").getValue().trim();
    public static final String KERBEROS_SSH_PORT = CommonVars.apply("wds.linkis.kerberos.ssh.port", "22").getValue().trim();
    public static final String KERBEROS_KDC_NODE = CommonVars.apply("wds.linkis.kerberos.kdc.node", "").getValue().trim();
    public static final String KERBEROS_KDC_USER_NAME = CommonVars.apply("wds.linkis.kerberos.kdc.user.name", "").getValue().trim();
    public static final String KERBEROS_KDC_USER_PASSWORD = CommonVars.apply("wds.linkis.kerberos.kdc.user.password", "").getValue().trim();
    public static final String KEBBEROS_ENABLE_SWITCH = CommonVars.apply("wds.linkis.kerberos.enable.switch", "").getValue().trim();
    public static final String DSS_DEPLOY_PATH = CommonVars.apply("wds.dss.deploy.path", "").getValue().trim();

}
