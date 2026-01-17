package ase_pr_inso_01.farm_service.models.dto;

import lombok.Data;

@Data
public class FeedbackAnswerDTO {
    private String questionId;
    private FeedbackOptionDTO selectedOption;
}