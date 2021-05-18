/*
 *
 *  * Copyright 2019 WeBank
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  *  you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  * http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package com.webank.wedatasphere.dss.workflow.io.scheduler;

import com.webank.wedatasphere.dss.common.exception.DSSErrorException;
import com.webank.wedatasphere.dss.workflow.scheduler.DssJobManager;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

@Component
public class IOManager extends DssJobManager {

    @PostConstruct
    public void init() {
        addDssJobHook(new IOJobHook());
    }

    public void submitIoJob(String userName, String comment,  Long... flowIDs) throws DSSErrorException {
        PublishJob exportJob = new PublishJob();
        exportJob.setDssJobListener(this);
        exportJob.setUser(userName);
        exportJob.setFlowIDs(flowIDs);
        exportJob.setComment(comment);
        submit(exportJob);
    }

}