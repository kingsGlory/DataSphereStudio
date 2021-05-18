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

package com.webank.wedatasphere.dss.workflow.appconn.opertion;

import com.webank.wedatasphere.dss.standard.app.development.DevelopmentService;
import com.webank.wedatasphere.dss.standard.app.development.publish.scheduler.PublishToSchedulerStage;
import com.webank.wedatasphere.dss.standard.app.development.publish.scheduler.RefScheduleOperation;
import com.webank.wedatasphere.dss.standard.common.entity.ref.RequestRef;
import com.webank.wedatasphere.dss.standard.common.entity.ref.ResponseRef;
import com.webank.wedatasphere.dss.workflow.appconn.stage.DefaultWorkflowGetRefStage;
import com.webank.wedatasphere.dss.standard.app.development.stage.GetRefStage;
import com.webank.wedatasphere.dss.workflow.appconn.stage.DefaultWorkflowPublishToSchedulerStage;


/**
 * @author allenlliu
 * @date 2020/11/25 11:04
 */
public class WorkflowRefScheduleOperation implements RefScheduleOperation<RequestRef, ResponseRef> {



    private DevelopmentService developmentService;

    @Override
    public PublishToSchedulerStage createPublishToSchedulerStage() {
        return new DefaultWorkflowPublishToSchedulerStage();
    }

    @Override
    public void setDevelopmentService(DevelopmentService service) {
        this.developmentService = service;
    }
}