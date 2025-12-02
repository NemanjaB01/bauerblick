
package com.agriscope.rule_engine.config;

import lombok.extern.slf4j.Slf4j;
import org.kie.api.KieServices;
import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.KieModule;
import org.kie.api.builder.Message;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.kie.internal.io.ResourceFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class DroolsConfig {

    private static final String RULES_SEED_PATH = "rules/safety/";
    private static final String RULES_IRRIGATION_PATH = "rules/irrigation/";
    private KieServices kieServices = KieServices.Factory.get();

    @Bean
    public KieContainer kieContainer() {

        KieFileSystem kieFileSystem = kieServices.newKieFileSystem();

        kieFileSystem.write(ResourceFactory.newClassPathResource(RULES_SEED_PATH + "wheat.drl"));
        kieFileSystem.write(ResourceFactory.newClassPathResource(RULES_SEED_PATH + "corn.drl"));
        kieFileSystem.write(ResourceFactory.newClassPathResource(RULES_SEED_PATH + "barley.drl"));
        kieFileSystem.write(ResourceFactory.newClassPathResource(RULES_SEED_PATH + "pumpkin.drl"));
        kieFileSystem.write(ResourceFactory.newClassPathResource(RULES_SEED_PATH + "black_grapes.drl"));
        kieFileSystem.write(ResourceFactory.newClassPathResource(RULES_SEED_PATH + "white_grapes.drl"));

        kieFileSystem.write(ResourceFactory.newClassPathResource(RULES_IRRIGATION_PATH + "irrigation.drl"));

        KieBuilder kieBuilder = kieServices.newKieBuilder(kieFileSystem);
        kieBuilder.buildAll();


        if (kieBuilder.getResults().hasMessages(Message.Level.ERROR)) {
            kieBuilder.getResults().getMessages(Message.Level.ERROR).forEach(msg ->
                    log.error("  - {}", msg.getText())
            );
            throw new RuntimeException("Drools build failed!");
        }

        KieModule kieModule = kieBuilder.getKieModule();
        log.info("Drools rules loaded successfully");

        return kieServices.newKieContainer(kieModule.getReleaseId());
    }

    @Bean
    public KieSession kieSession() {
        return kieContainer().newKieSession();
    }
}