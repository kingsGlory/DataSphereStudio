/*
 * Copyright 2019 WeBank
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package com.webank.wedatasphere.dss.common.utils;

import java.io.File;
import java.util.HashSet;
import java.util.regex.Pattern;

/**
 * created by enjoyyin on 2019/6/14
 * Description: FileHelper 是 linux 文件系统的帮助类，检查目录是否存在等
 */
public class FileHelper {

    private static Pattern FilePattern = Pattern.compile("[\\\\/:*?\"<>|]");

    /**
     * 路径遍历 漏洞修复
     * @param str
     * @return
     */
    public static String filenameFilter(String str) {
        return str==null?null:FilePattern.matcher(str).replaceAll("");
    }

    public static boolean checkDirExists(String dir){
        dir = FileHelper.filenameFilter(dir);
        File file = new File("");
        return file.exists() && file.isDirectory();
    }

}
