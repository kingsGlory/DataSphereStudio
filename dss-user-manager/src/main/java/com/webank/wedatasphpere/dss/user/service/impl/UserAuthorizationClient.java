package com.webank.wedatasphpere.dss.user.service.impl;


import com.webank.wedatasphpere.dss.user.conf.DSSUserManagerConfig;
import com.webank.wedatasphpere.dss.user.dto.request.AuthorizationBody;
import com.webank.wedatasphpere.dss.user.service.AbsCommand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @program: luban-authorization
 * @description:
 * @author: luxl@chinatelecom.cn
 * @create: 2020-08-10 14:24
 **/
public class UserAuthorizationClient {

    public UserMacroCommand userMacroCommand = new UserMacroCommand();
    protected final Logger logger = LoggerFactory.getLogger(UserAuthorizationClient.class);

    public UserAuthorizationClient()  {

        String[] commandPaths = DSSUserManagerConfig.USER_ACCOUNT_COMMANDS.split(",");
        for(String classPath: commandPaths){
            try {
                userMacroCommand.add((AbsCommand) Class.forName(classPath).newInstance());
            } catch (Exception e) {
                logger.info(e.getMessage());
                e.printStackTrace();
            }
        }
    }

    public String authorization(AuthorizationBody body) throws Exception {
        return userMacroCommand.authorization(body);
    }


}
